package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"slices"
	"strings"
	"github.com/gorilla/websocket"
)

type Client struct {
	Conn *websocket.Conn
	AssemblyConn  *websocket.Conn
	Done   chan struct{}
	Transcript *TranscriptState
}

type TranscriptState struct {
	
	WordsTranscript []string
	CurrentSentence    []string 
	PartialWord   []string 
	CurrentTurnID int   

}

func (c *Client) addWordsTranscript(t string){
	c.Transcript.WordsTranscript = append(c.Transcript.WordsTranscript, t)
}

func (c *Client) setCurrentSentence(t string){
	h := make([]string, 0)
	h = append(h, t)
	c.Transcript.CurrentSentence = h 
}

func (c *Client) setPartialWord(t string){
	h := make([]string, 0)
	h = append(h, t)
	c.Transcript.PartialWord = h
}

type AssemblyResponseWord struct {
    Start       int     `json:"start"`
    End         int     `json:"end"`
    Text        string  `json:"text"`
    Confidence  float64 `json:"confidence"`
    WordIsFinal bool    `json:"word_is_final"`
}

type AssemblyRessponseTurn struct {
    TurnOrder          int     `json:"turn_order"`
    Transcript         string  `json:"transcript"`
    EndOfTurn          bool    `json:"end_of_turn"`
    EndOfTurnConfidence float64 `json:"end_of_turn_confidence"`
    Words              []AssemblyResponseWord  `json:"words"`
    Type               string  `json:"type"`
}


func NewClient (Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client {
		Conn: Conn,
		AssemblyConn: AssemblyConn,
		Done: make(chan struct{}),
		Transcript: NewTranscriptState(),	
	}
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState {
		CurrentSentence : make([]string, 0),
		PartialWord: make([]string, 0),
		CurrentTurnID: -1,
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
}

func (c *Client) updateStateTranscript(jsonData []byte) error {
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		err1 := errors.New("cant parse json from Assembly: ")
		joinErr := errors.Join(err1, err)
		return joinErr
	}

	if turn.EndOfTurn {
		c.addWordsTranscript(turn.Transcript)
	}
		
	c.setCurrentSentence(turn.Transcript)

	for _, word := range turn.Words {
		if !word.WordIsFinal {
			c.setPartialWord(word.Text)
		}
	}
	return nil

}

func (c *Client) save() {
	// handle save all words to db
}


 
