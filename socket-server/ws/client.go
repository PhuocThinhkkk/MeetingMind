package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

var MaxErr = 10
var mutex  sync.Mutex

type Client struct {
	Conn         *websocket.Conn
	AssemblyConn *websocket.Conn
	Done         chan struct{}
	Transcript   *TranscriptState
	TranscriptWord   chan(ClientWriter)
	TranslateWord    chan(TranslateWordsRes)
}

type TranscriptState struct {
	WordsTranscript chan(string)
	CurrentSentence []string
	NewWords        []AssemblyResponseWord
	CurrentTurnID   int
	EndOfTurn       bool
}

func (c *Client) addWordsTranscript(t string) *Client {
	c.Transcript.WordsTranscript <- t
	return c
}

type TranslateWordsRes struct {
	Type    string
	Words   string
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
	IsEndOfTurn bool                   `json:"isEndOfTurn"`
	Words       []AssemblyResponseWord `json:"words"`
}

func NewClient(Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client{
		Conn:         Conn,
		AssemblyConn: AssemblyConn,
		Done:         make(chan struct{}),
		Transcript:   NewTranscriptState(),
		TranscriptWord:  make(chan ClientWriter),
		TranslateWord: make(chan TranslateWordsRes),
	}
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		WordsTranscript: make(chan string),
		CurrentSentence: make([]string, 0, 10),
		CurrentTurnID:   -1,
		NewWords:        make([]AssemblyResponseWord, 0, 10),
		EndOfTurn:       false,
	}
}

func NewClientWrtter(isFinal bool, words []AssemblyResponseWord) *ClientWriter {
	return &ClientWriter{
		IsEndOfTurn: isFinal,
		Words:       words,
	}
}

func RegisterClient(client *Client) {

	go client.readClientAudio()
	go client.readMsgTranscript()
	go client.sendMsgTranscript()
	go client.sendMsgTranslate()

}

func (c *Client) readClientAudio() {
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

func (c *Client) readMsgTranscript() {
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
				mutex.Lock()
				c.Conn.WriteMessage(websocket.TextMessage, []byte(`{"type" : "ready"}`))
				log.Println("Got Begin:", string(msg))
				mutex.Unlock()
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
				c.TranscriptWord <- *cw


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
				byteMsg, err := json.Marshal( msg )
				if err != nil {
					log.Println("err when encoding transcript word msg: ", err )
					continue
				}
				mutex.Lock()
				log.Println("Transcript : ", string(byteMsg))
				c.Conn.WriteMessage(websocket.TextMessage, byteMsg)
				mutex.Unlock()
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
				byteMsg, err := json.Marshal( msg )
				if err != nil {
					log.Println("err when encoding translate word msg: ", err )
					continue
				}
				mutex.Lock()
				log.Println("Translate : ", string(byteMsg))
				c.Conn.WriteMessage(websocket.TextMessage, byteMsg)
				mutex.Unlock()
			}
		}
	}
}

func UnregisterClient(c *Client) {
	_, ok := <-c.Done
	if ok {
		close(c.Done)
	}
}

func (c *Client) updateStateTranscript(jsonData []byte) error {
	log.Println("update ", string(jsonData))
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		err1 := errors.New("cant parse json from Assembly: ")
		joinErr := errors.Join(err1, err)
		return joinErr
	}

	c.Transcript.NewWords = make([]AssemblyResponseWord, 0, 10)
	for index, assemblyWord := range turn.Words {

		c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)
		if !assemblyWord.WordIsFinal {
			continue
		}

		if index >= len(c.Transcript.CurrentSentence) {
			log.Println("hi mom")
			c.Transcript.CurrentSentence = append(c.Transcript.CurrentSentence, assemblyWord.Text)
			log.Println("ladfkj")
			continue
		}

		if assemblyWord.Text != c.Transcript.CurrentSentence[index] {

			log.Println("got em")
			c.Transcript.CurrentSentence[index] = assemblyWord.Text
			log.Println("ladfj")

		}

	}

	c.Transcript.EndOfTurn = turn.EndOfTurn

	if turn.EndOfTurn {
		c.addWordsTranscript(turn.Transcript)
		c.Transcript.CurrentSentence = make([]string, 0, 10)
	}

	return nil

}
