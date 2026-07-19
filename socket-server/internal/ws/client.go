package ws

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserId       string
	Conn         *websocket.Conn
	AssemblyConn *websocket.Conn
	Done         chan struct{}
	Transcript   *TranscriptState
	Hub          *TranscriptHub
	Mu           sync.Mutex
	StartTime    time.Time
	ExpiresAt    time.Time
}

func NewClient(UserId string, Conn *websocket.Conn, AssemblyConn *websocket.Conn) *Client {
	return &Client{
		UserId:       UserId,
		Conn:         Conn,
		AssemblyConn: AssemblyConn,
		Done:         make(chan struct{}),
		Transcript:   NewTranscriptState(),
		Hub:          NewTranscriptHub(),
		Mu:           sync.Mutex{},
		StartTime:    time.Now(),
		ExpiresAt:    time.Now().Add(30 * time.Minute),
	}
}

func RegisterClient(client *Client) {
	log.Println("Registering new client: ", client.UserId)

	go client.processClientAudio()
	go client.processMsgTranscript()

	if client.Hub != nil {
		transcriptSender := NewTranscriptSender(client, client.Hub)
		go transcriptSender.Start()

		translateWorker := NewTranslateWorker(client, client.Hub)
		go translateWorker.Start()
	} else {
		log.Printf("Client %s has no Hub, cannot start sender/translator workers.", client.UserId)
	}
}

func UnregisterClient(c *Client) {
	select {
	case <-c.Done:
		// already closed
	default:
		close(c.Done)
	}
	log.Println("Unregistered client: ", c.UserId)
}

func (c *Client) Expired() bool {
	return time.Now().After(c.ExpiresAt)
}
