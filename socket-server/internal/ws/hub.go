package ws

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
)

// TranscriptHub manages subscriptions and broadcasts TranscriptEvents.
type TranscriptHub struct {
	subscribers map[string]chan TranscriptEvent
	mu          sync.RWMutex
}

// NewTranscriptHub creates a new TranscriptHub.
func NewTranscriptHub() *TranscriptHub {
	return &TranscriptHub{
		subscribers: make(map[string]chan TranscriptEvent),
	}
}

// Subscribe adds a new subscriber to the hub with a buffered channel.
// Returns the channel and a unique subscriber ID for unsubscribing.
func (h *TranscriptHub) Subscribe(bufferSize int) (<-chan TranscriptEvent, string) {
	subID := generateUniqueId()
	h.mu.Lock()
	defer h.mu.Unlock()

	ch := make(chan TranscriptEvent, bufferSize)
	h.subscribers[subID] = ch
	return ch, subID
}

// Publish broadcasts a TranscriptEvent to all subscribers.
func (h *TranscriptHub) Publish(event TranscriptEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, ch := range h.subscribers {
		select {
		case ch <- event:
		default:
			// Subscriber channel is full, drop the event
		}
	}
}

// Unsubscribe removes a subscriber from the hub.
func (h *TranscriptHub) Unsubscribe(subID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if ch, ok := h.subscribers[subID]; ok {
		close(ch)
		delete(h.subscribers, subID)
	}
}

func generateUniqueId() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "fallback_id"
	}
	return hex.EncodeToString(bytes)
}
