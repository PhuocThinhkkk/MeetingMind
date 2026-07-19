package ws

import (
	"encoding/json"
	"errors"
	"log"
	"time"
)

type TranscriptState struct {
	CurrentSentence []string
	NewWords        []AssemblyResponseWord
	CurrentTurnID   int
	EndOfTurn       bool
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		CurrentSentence: make([]string, 0, 10),
		CurrentTurnID:   -1,
		NewWords:        make([]AssemblyResponseWord, 0, 10),
		EndOfTurn:       false,
	}
}

// updateStateTranscript processes raw transcript data, updates the client's state,
// builds a TranscriptEvent, and publishes it to the TranscriptHub.
func (c *Client) updateStateTranscript(jsonData []byte) error {
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		return errors.Join(errors.New("cant parse json from Assembly: "), err)
	}

	c.Mu.Lock()
	defer c.Mu.Unlock()

	c.Transcript.NewWords = make([]AssemblyResponseWord, 0, 10)
	for index, assemblyWord := range turn.Words {
		if !assemblyWord.WordIsFinal {
			c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)
			continue
		}

		if index >= len(c.Transcript.CurrentSentence) {
			c.Transcript.CurrentSentence = append(c.Transcript.CurrentSentence, assemblyWord.Text)
			c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)
			continue
		}

		if assemblyWord.Text != c.Transcript.CurrentSentence[index] {
			c.Transcript.CurrentSentence[index] = assemblyWord.Text
			c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)
		}
	}

	c.Transcript.EndOfTurn = turn.EndOfTurn
	if turn.EndOfTurn {
		c.Transcript.CurrentSentence = make([]string, 0, 10)
	}

	// Build the TranscriptEvent
	event := TranscriptEvent{
		TurnId:     string(rune(turn.TurnOrder)), // or something else, but TurnId is string
		Text:       turn.Transcript,
		IsFinal:    turn.EndOfTurn,
		Confidence: turn.EndOfTurnConfidence,
		Words:      turn.Words, // Using raw words from assembly here, or c.Transcript.NewWords if that's preferred
		Timestamp:  time.Now(),
	}

	// Publish the event to the hub
	if c.Hub != nil {
		c.Hub.Publish(event)
	} else {
		log.Printf("Client %s has no Hub assigned, cannot publish event.", c.UserId)
	}

	return nil
}
