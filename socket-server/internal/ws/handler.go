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
		UnregisterClient(c)
	}()

	for {
		select {
		case <-c.Done:
			c.Conn.Close()
			return
		default:

			if errCount >= MaxErr {
				log.Println("max err hit in read audio")
				return
			}

			if c.Expired() {
				c.Mu.Lock()
				c.Conn.WriteJSON(map[string]any{
					"type":    "error",
					"message": "Your 30-minute session has expired",
				})
				c.Mu.Unlock()
				return
			}

			msgType, audio, err := c.Conn.ReadMessage()
			if err != nil {
				log.Println("err read message :", err)
				continue
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
	errCount := 0
	defer func() {
		UnregisterClient(c)
	}()
	for {
		select {
		case <-c.Done:
			c.AssemblyConn.Close()
			return
		default:

			if errCount >= MaxErr {
				log.Println("max err hit in write message")
				return
			}

			msgType, msg, err := c.AssemblyConn.ReadMessage()
			if err != nil {
				log.Println("AssemblyAI return an error:", err)
				errCount++
				continue
			}
			if msgType != websocket.TextMessage {
				fmt.Println("from assembly, this is not a text message")
				errCount++
				continue
			}

			var parsed map[string]interface{}
			err = json.Unmarshal(msg, &parsed)
			if err != nil {
				log.Println("cant parse json: ", err)
				errCount++
				continue
			}

			if parsed["type"] == "SessionBegins" || parsed["type"] == "Begin" {
				c.Mu.Lock()
				c.Conn.WriteMessage(websocket.TextMessage, []byte(`{"type" : "ready"}`))
				log.Println("Got Begin:", string(msg))
				c.Mu.Unlock()
			}
			if parsed["type"] == "Termination" {
				log.Println("session end.")
				return
			}
			if parsed["type"] == "SessionInformation" {
				log.Println("Got SessionInformation")
				continue
			}
			if parsed["type"] == "FinalTranscript" || parsed["type"] == "PartialTranscript" || parsed["type"] == "Turn" {
				err = c.updateStateTranscript(msg)
				if err != nil {
					log.Println("err when update transcript: ", err)
					return
				}
			}
		}
	}
}
