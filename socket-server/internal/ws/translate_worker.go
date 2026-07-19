package ws

import (
	"log"
)

// TranslateWorker subscribes to the TranscriptHub, translates transcript events, and sends them to the client's websocket.
type TranslateWorker struct {
	client *Client
	hub    *TranscriptHub
}

// NewTranslateWorker creates a new TranslateWorker.
func NewTranslateWorker(client *Client, hub *TranscriptHub) *TranslateWorker {
	return &TranslateWorker{
		client: client,
		hub:    hub,
	}
}

// Start begins the TranslateWorker's message processing loop.
func (tw *TranslateWorker) Start() {
	transcriptChan, subID := tw.hub.Subscribe(10)
	defer tw.hub.Unsubscribe(subID)

	for {
		select {
		case event, ok := <-transcriptChan:
			if !ok {
				log.Println("Transcript channel closed, stopping translator.")
				return
			}
			tw.processAndTranslate(event)
		case <-tw.client.Done:
			log.Println("Client done, stopping translate worker.")
			return
		}
	}
}

// processAndTranslate processes a TranscriptEvent, translates it, and sends the result.
func (tw *TranslateWorker) processAndTranslate(event TranscriptEvent) {
	translatedText, err := Translate("en", event.Words)
	if err != nil {
		log.Printf("Translation failed for client %s: %v\n", tw.client.UserId, err)
		return
	}

	writer := TranslateWriter{
		Type:           TRANSLATE_RESPONSE,
		Event:          event,
		Language:       "en",
		TranslatedText: translatedText,
	}

	tw.client.Mu.Lock()
	defer tw.client.Mu.Unlock()

	err = tw.client.Conn.WriteJSON(writer)
	if err != nil {
		log.Printf("Error sending translated text to client %s: %v\n", tw.client.UserId, err)
	}
}
