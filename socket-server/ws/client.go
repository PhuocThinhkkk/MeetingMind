package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)
var MaxErr = 10

type Client struct {
	Conn         *websocket.Conn
	AssemblyConn *websocket.Conn
	Done         chan struct{}
	Transcript   *TranscriptState
	Time   int64
}

type TranscriptState struct {
	WordsTranscript string
	CurrentSentence []string
	NewWords        []AssemblyResponseWord
	CurrentTurnID   int
	EndOfTurn       bool
}

func (c *Client) addWordsTranscript(t string) *Client {
	c.Transcript.WordsTranscript = c.Transcript.WordsTranscript + " " + t
	return c
}

type AssemblyResponseWord struct {
	Start       int     `json:"start"`
	End         int     `json:"end"`
	Text        string  `json:"text"`
	Confidence  float64 `json:"confidence"`
	WordIsFinal bool    `json:"word_is_final"`
}

type AssemblyRessponseTurn struct {
	TurnOrder           int                    `json:"turn_order"`
	Transcript          string                 `json:"transcript"`
	EndOfTurn           bool                   `json:"end_of_turn"`
	EndOfTurnConfidence float64                `json:"end_of_turn_confidence"`
	Words               []AssemblyResponseWord `json:"words"`
	Type                string                 `json:"type"`
}

type ClientWriter struct {
	IsEndOfTurn bool     `json:"isEndOfTurn"`
	Words       []AssemblyResponseWord `json:"words"`
}

func NewClient(Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client{
		Conn:         Conn,
		AssemblyConn: AssemblyConn,
		Done:         make(chan struct{}),
		Transcript:   NewTranscriptState(),
	}
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		WordsTranscript: "",
		CurrentSentence: make([]string, 0, 10),
		CurrentTurnID:   -1,
		NewWords: make([]AssemblyResponseWord, 0, 10),
		EndOfTurn: false,
	}
}

func NewClientWrtter(isFinal bool, words []AssemblyResponseWord) *ClientWriter {
	return &ClientWriter{
		IsEndOfTurn: isFinal,
		Words:       words,
	}
}

func RegisterClient(client *Client) {

	go client.writeText()
	go client.readAudio()

}

func (c *Client) readAudio() {
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

			msgType, audio, err := c.Conn.ReadMessage()
			if err != nil {
				log.Println("err read message :", err)
				c.Conn.Close()
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

func (c *Client) writeText() {
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
				c.Conn.WriteMessage(websocket.TextMessage, []byte(`{"type" : "ready"}`))
				log.Println("Got Begin:", string(msg))
			}
			if parsed["type"] == "Termination" {
				log.Println("session end.")
				return
			}
			if parsed["type"] == "Turn" {

				err = c.updateStateTranscript(msg)
				if err != nil {
					log.Println("err when update transcript: ", err)
					return
				}
				cw := NewClientWrtter(c.Transcript.EndOfTurn, c.Transcript.NewWords)
				res, err := json.Marshal(cw)
				if err != nil {
					log.Println("err when encode json: ", err)
					errCount++
					continue
				}

				log.Println("Got Turn: ", string(res))

				if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					fmt.Println("err write message :", err)
					errCount++
					return
				}

			}
		}
	}
}

func UnregisterClient(c *Client) {
	_, ok := <- c.Done
	if ok {	
		close(c.Done)
	} 
}

func (c *Client) updateStateTranscript(jsonData []byte) error {
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		err1 := errors.New("cant parse json from Assembly: ")
		joinErr := errors.Join(err1, err)
		return joinErr
	}


	c.Transcript.NewWords = make([]AssemblyResponseWord, 0, 10)
	for index, assemblyWord := range turn.Words {

		if index >= len(c.Transcript.CurrentSentence) {
			c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)

			if !assemblyWord.WordIsFinal {
				continue
			}

			c.Transcript.CurrentSentence = append(c.Transcript.CurrentSentence, assemblyWord.Text)
			continue
		}

		if assemblyWord.Text != c.Transcript.CurrentSentence[index]{
			c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)

			if !assemblyWord.WordIsFinal {
				continue
			}

			c.Transcript.CurrentSentence[index] = assemblyWord.Text
		}
		
	}
	
	c.Transcript.EndOfTurn = turn.EndOfTurn

	if turn.EndOfTurn {
		c.addWordsTranscript(turn.Transcript)
		c.Transcript.CurrentSentence = make([]string, 0, 10)
	}

	return nil

}

func (c *Client) save() {
	// handle save all words to db
}
