package ws

import (
	"log"
	"encoding/json"
    "github.com/gorilla/websocket"
	"fmt"
)

type Client struct {
	Conn *websocket.Conn
	Text  chan []byte
	AssemblyConn  *websocket.Conn
	Done   chan struct{}
}

func NewClient (Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client {
		Conn: Conn,
		Text: make(chan []byte),
		AssemblyConn: AssemblyConn,
		Done: make(chan struct{}),
	}
}


func RegisterClient(client *Client) {

    go client.writeText()
    go client.readAudio()

}

func (c *Client) readAudio() {
    defer func() {
        UnregisterClient(c)
    }()

    for {
        msgType, audio, err := c.Conn.ReadMessage()
        if err != nil {
			log.Println("err read message :", err)
			return
        }
		if msgType != websocket.BinaryMessage {
			log.Println("this is not a binary file")
			continue
		}

		err = c.AssemblyConn.WriteMessage(websocket.BinaryMessage, audio)
		if err != nil {
			log.Println("err when sending audio to assembly", err)
			continue
		}

    }
}

func (c *Client) writeText() {
	for{
		select {
		case <- c.Done:
			c.AssemblyConn.Close()
			return
		default:

			msgType, msg, err := c.AssemblyConn.ReadMessage()
			if err != nil {
				log.Println("AssemblyAI dropped connection immediately:", err)
				c.AssemblyConn.Close()
				return
			}
			if msgType != websocket.TextMessage {
				fmt.Println("from assembly, this is not a text message")
				continue
			}

			var parsed map[string]interface{}
			_ = json.Unmarshal(msg, &parsed)

			if parsed["type"] == "Begin" {

				log.Println("Got Begin:", string(msg))

			}else if parsed["type"] == "Turn" {

				if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					fmt.Println("err write message :", err)
					return
				}
				log.Println("Got Turn. Forwarding to client: ", string(msg))

			}else if parsed["type"] == "Termination" {

				log.Println("session end.")
				return
			} else {

				log.Println("Unknown message type:", parsed["type"])

			}
		}
    }
}


func UnregisterClient(c *Client) {
	close(c.Done)
    c.Conn.Close()
    close(c.Text)
}
