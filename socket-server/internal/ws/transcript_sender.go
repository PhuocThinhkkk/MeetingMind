package ws

import (
	"log"
)

// TranscriptSender subscribes to the TranscriptHub and sends transcript events to the client's websocket connection.
type TranscriptSender struct {
	client *Client
	hub    *TranscriptHub
}

// NewTranscriptSender creates a new TranscriptSender.
func NewTranscriptSender(client *Client, hub *TranscriptHub) *TranscriptSender {
	return &TranscriptSender{
		client: client,
		hub:    hub,
	}
}

// Start begins the TranscriptSender's message processing loop.
func (ts *TranscriptSender) Start() {
	transcriptChan, subID := ts.hub.Subscribe(10)
	defer ts.hub.Unsubscribe(subID)

	for {
		select {
		case event, ok := <-transcriptChan:
			if !ok {
				log.Println("Transcript channel closed, stopping sender.")
				return
			}
			ts.sendTranscript(event)
		case <-ts.client.Done:
			log.Println("Client done, stopping transcript sender.")
			return
		}
	}
}

// sendTranscript formats and sends the TranscriptEvent to the websocket.
func (ts *TranscriptSender) sendTranscript(event TranscriptEvent) {
	writer := TranscriptWriter{
		Type:  TRANSCRIPT_RESPONSE,
		Event: event,
	}

	err := ts.client.safeWriteJson(writer)
	if err != nil {
		log.Printf("Error sending transcript to client %s: %v\n", ts.client.UserId, err)
	}
}
