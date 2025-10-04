package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn           *websocket.Conn
	AssemblyConn   *websocket.Conn
	Done           chan struct{}
	Transcript     *TranscriptState
	TranscriptWord chan (*TranscriptWriter)
	TranslateWord  chan (*TranslateWriter)
	Mu             sync.Mutex
}

func NewClient(Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client{
		Conn:           Conn,
		AssemblyConn:   AssemblyConn,
		Done:           make(chan struct{}),
		Transcript:     NewTranscriptState(),
		TranscriptWord: make(chan *TranscriptWriter),
		TranslateWord:  make(chan *TranslateWriter),
		Mu:             sync.Mutex{},
	}
}

func RegisterClient(client *Client) {

	go client.processClientAudio()
	go client.processMsgTranscript()

	go client.readTranslate()

	go client.sendMsgTranscript()
	go client.sendMsgTranslate()

}

func UnregisterClient(c *Client) {
	_, ok := <-c.Done
	if ok {
		close(c.Done)
	}
}
