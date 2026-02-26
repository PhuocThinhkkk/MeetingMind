package ws

import (
	"encoding/json"
	"errors"
	"log"
)

type TranscriptWriter struct {
	Type        RESPONSE_TYPE          `json:"type"`
	IsEndOfTurn bool                   `json:"isEndOfTurn"`
	Words       []AssemblyResponseWord `json:"words"`
}

type TranscriptState struct {
	CurrentWordsTranscript chan (string)
	CurrentSentence        []string
	NewWords               []AssemblyResponseWord
	CurrentTurnID          int
	EndOfTurn              bool
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		CurrentWordsTranscript: make(chan string),
		CurrentSentence: make([]string, 0, 10),
		CurrentTurnID:   -1,
		NewWords:        make([]AssemblyResponseWord, 0, 10),
		EndOfTurn:       false,
	}
}

func NewTranscriptWriter(isFinal bool, words []AssemblyResponseWord) *TranscriptWriter {
	return &TranscriptWriter{
		Type:        TRANSCRIPT_RESPONSE,
		IsEndOfTurn: isFinal,
		Words:       words,
	}
}

// Process the json data making the state short to send to client.
// These words are store in the client state Transcript.
// The client will receive only the new words or the updated words.
// Also translate service will use this state to translate only the new words.
func (c *Client) updateStateTranscript(jsonData []byte) error {
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		err1 := errors.New("cant parse json from Assembly: ")
		joinErr := errors.Join(err1, err)
		return joinErr
	}
	log.Println("[INFOR] process client msg")

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

	clientTranscriptWriter := NewTranscriptWriter(c.Transcript.EndOfTurn, c.Transcript.NewWords)
	c.TranscriptWord <- clientTranscriptWriter

	str := ""
	for _, w := range c.Transcript.NewWords {
		str += w.Text + " "
	}
	c.Transcript.CurrentWordsTranscript <- str

	return nil

}
