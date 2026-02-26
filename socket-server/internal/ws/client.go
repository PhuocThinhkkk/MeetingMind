package ws

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserId         string
	Conn           *websocket.Conn
	AssemblyConn   *websocket.Conn
	Done           chan struct{}
	Transcript     *TranscriptState
	TranscriptWord chan (*TranscriptWriter)
	TranslateWord  chan (*TranslateWriter)
	Mu             sync.Mutex
	StartTime      time.Time
	ExpiresAt      time.Time
}

func NewClient(UserId string, Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client{
		UserId:         UserId,
		Conn:           Conn,
		AssemblyConn:   AssemblyConn,
		Done:           make(chan struct{}),
		Transcript:     NewTranscriptState(),
		TranscriptWord: make(chan *TranscriptWriter),
		TranslateWord:  make(chan *TranslateWriter),
		Mu:             sync.Mutex{},
		StartTime:      time.Now(),
		ExpiresAt:      time.Now().Add(30 * time.Minute), 
	}
}

func RegisterClient(client *Client) {
	log.Println("Registering new client: ", client.UserId)

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
	log.Println("Unregistered client: ", c.UserId)
}
