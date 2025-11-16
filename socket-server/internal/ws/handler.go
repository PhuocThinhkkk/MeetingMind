package ws

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"strings"
	"time"
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
					"message": "Your 20-minute session has expired",
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
				log.Println("AssemblyAI dropped connection immediately:", err)
				c.AssemblyConn.Close()
				return
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

			if parsed["type"] == "Begin" {
				c.Mu.Lock()
				c.Conn.WriteMessage(websocket.TextMessage, []byte(`{"type" : "ready"}`))
				log.Println("Got Begin:", string(msg))
				c.Mu.Unlock()
			}
			if parsed["type"] == "Termination" {
				log.Println("session end.")
				return
			}
			if parsed["type"] == "Turn" {
				log.Println("hello", len(msg), " length of bytes")

				err = c.updateStateTranscript(msg)
				if err != nil {
					log.Println("err when update transcript: ", err)
					return
				}
				log.Println("[INFOR] Recived ", len(msg), " length of bytes")

			}
		}
	}
}

func (c *Client) readTranslate() {
	defer func() {
		UnregisterClient(c)
	}()
	for {
		select {
		case <-c.Done:
			c.AssemblyConn.Close()
			return
		default:
			s := "Hello, this is a test translation. I will handle this later. "
			arr := strings.Split(s, " ")
			i := 0
			for msg := range c.Transcript.CurrentWordsTranscript {
				byteMsg, err := json.Marshal(msg)
				if err != nil {
					log.Println("err when encoding transcript word msg: ", err)
					continue
				}
				log.Println("Infor: reading translate")

				_ = byteMsg
				// TODO: call translation api here
				// For now just do a dummy translation
				if i >= len(arr) {
					i = 0
				}
				res := NewTranslateWriter(arr[i])
				i++
				log.Println("sending translate to chan")
				c.TranslateWord <- res
			}
		}
	}
}

func (c *Client) sendMsgTranscript() {
	defer func() {
		UnregisterClient(c)
	}()
	for {
		select {
		case <-c.Done:
			c.AssemblyConn.Close()
			return
		default:
			for msg := range c.TranscriptWord {
				byteMsg, err := json.Marshal(msg)
				if err != nil {
					log.Println("err when encoding transcript word msg: ", err)
					continue
				}
				c.Mu.Lock()
				c.Conn.WriteMessage(websocket.TextMessage, byteMsg)
				c.Mu.Unlock()
			}
		}
	}
}

func (c *Client) sendMsgTranslate() {
	defer func() {
		UnregisterClient(c)
	}()
	for {
		select {
		case <-c.Done:
			c.AssemblyConn.Close()
			return
		default:
			for msg := range c.TranslateWord {
				byteMsg, err := json.Marshal(msg)
				if err != nil {
					log.Println("err when encoding translate word msg: ", err)
					continue
				}
				c.Mu.Lock()
				log.Println("Translate : ", string(byteMsg))
				c.Conn.WriteMessage(websocket.TextMessage, byteMsg)
				c.Mu.Unlock()
			}
		}
	}
}

func (c *Client) Expired() bool {
	return time.Now().After(c.ExpiresAt)
}
