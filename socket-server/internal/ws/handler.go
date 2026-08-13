package ws

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

func (c *Client) processClientAudio() {
	errCount := 0
	defer func() {
		log.Println("close client connection: ", c.UserId)
		c.Conn.Close()
		UnregisterClient(c)
	}()

	for {
		select {
		case <-c.Done:
			return
		default:
			if errCount >= MaxErr {
				log.Println("max err hit in read audio")
				return
			}

			if c.Expired() {
				c.safeWriteJson(map[string]any{
					"type":    "error",
					"message": "Your 30-minute session has expired",
				})
				return
			}

			msgType, audio, err := c.Conn.ReadMessage()
			if err != nil {
				log.Printf("err reading message: %v; stopping this client", err)
				return
			}

			if msgType != websocket.BinaryMessage {
				log.Println("this is not a binary file")
				errCount++
				continue
			}

			err = c.AssemblyConn.WriteMessage(websocket.BinaryMessage, audio)
			if err != nil {
				log.Println("err when sending audio to assembly", err)
				errCount++
				continue
			}
		}

	}
}

func (c *Client) processMsgTranscript() {
    defer func() {
        UnregisterClient(c)
    }()

    terminated := false

    for {
        if !terminated {
            select {
            case <-c.Done:
                c.TerminateAssemblySession()
                terminated = true

            default:
            }
        }

        msgType, msg, err := c.AssemblyConn.ReadMessage()
        if err != nil {
            log.Println("AssemblyAI read error:", err)
            return
        }

		parsed, err := parseAssemblyMessage(msgType, msg)
		if err != nil {
			log.Println(err)
			continue
		}
       
        switch parsed["type"] {

        case "Termination":
			handleCloseAssembly(c.AssemblyConn, string(msg), c.UserId)
            return

        case "SessionBegins", "Begin":
            c.safeWriteJson(map[string]string{
                "type": "ready",
            })

        case "SessionInformation":
            continue

        case "FinalTranscript", "PartialTranscript", "Turn":
            if err := c.updateStateTranscript(msg); err != nil {
                log.Println("error updating transcript:", err)
                return
            }
        }
    }
}

func (c *Client) TerminateAssemblySession() {
	// Tell AssemblyAI to terminate the streaming session.
	err := c.AssemblyConn.WriteJSON(map[string]string{
		"type": "Terminate",
	})
	if err != nil {
		log.Printf(
			"Error terminating AssemblyAI session for client %s: %v",
			c.UserId,
			err,
		)
		return
	}

	log.Println("Terminate sent to AssemblyAI:", c.UserId)

	// read goroutine should receive the "Termination"
	// message from AssemblyAI and then close the connection.
}


func parseAssemblyMessage(msgType int, msg []byte) (map[string]interface{}, error) {
	if msgType != websocket.TextMessage {
		return nil, fmt.Errorf("message from AssemblyAI is not a text message")
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(msg, &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse AssemblyAI message: %w", err)
	}

	return parsed, nil
}

