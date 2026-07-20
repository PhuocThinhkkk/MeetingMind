package ws

import (
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"time"
)

type TranscriptState struct {
	transcripts []TranscriptEvent
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		transcripts: make([]TranscriptEvent,0, 120),
	}
}

// updateStateTranscript processes raw transcript data, updates the client's state,
// builds a TranscriptEvent, and publishes it to the TranscriptHub.
func (c *Client) updateStateTranscript(jsonData []byte) error {
	c.Mu.Lock()
	defer c.Mu.Unlock()

	turn, err := checkTypeAssemblyResponseTurn(jsonData)
	if err != nil {
		return err
	}

	event := TranscriptEvent{
		TurnId:     strconv.Itoa(turn.TurnOrder),
		Text:       turn.Transcript,
		IsFinal:    turn.EndOfTurn,
		Confidence: turn.EndOfTurnConfidence,
		Words:      turn.Words, 
		Timestamp:  time.Now(),
	}

	c.Transcript.transcripts = append(c.Transcript.transcripts, event)

	if c.Hub != nil {
		c.Hub.Publish(event)
	} else {
		log.Printf("Client %s has no Hub assigned, cannot publish event.", c.UserId)
	}

	return nil
}


func checkTypeAssemblyResponseTurn(jsonData []byte) (AssemblyResponseTurn, error) {
    var turn AssemblyResponseTurn

    err := json.Unmarshal(jsonData, &turn)
    if err != nil {
        return AssemblyResponseTurn{}, errors.Join(
            errors.New("can't parse json from Assembly"),
            err,
        )
    }

    return turn, nil
}