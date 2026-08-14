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
	Translate    *TranslateState
	Hub          *TranscriptHub
	writeMu           sync.Mutex
	StartTime    time.Time
	ExpiresAt    time.Time
}

// NewClient creates a client with initialized transcript, translation, hub, lifecycle, and expiration state.
// It returns an error if translation state initialization fails.
func NewClient(UserId string, Conn *websocket.Conn, AssemblyConn *websocket.Conn) (*Client, error) {
	translate, err := NewTranslationState("vi")
	if err != nil {
		return nil, err
	}

	return &Client{
		UserId:       UserId,
		Conn:         Conn,
		AssemblyConn: AssemblyConn,
		Done:         make(chan struct{}),
		Transcript:   NewTranscriptState(),
		Translate: 	  translate,
		Hub:          NewTranscriptHub(),
		writeMu:           sync.Mutex{},
		StartTime:    time.Now(),
		ExpiresAt:    time.Now().Add(30 * time.Minute),
	}, nil
}


func (client *Client) safeWriteJson(writer any) error{
	client.writeMu.Lock()
	defer client.writeMu.Unlock()

	return client.Conn.WriteJSON(writer)
}

// RegisterClient starts the client’s audio, transcript, and available hub-based processing workers.
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

// UnregisterClient signals that the client is no longer registered and logs its user ID.
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
