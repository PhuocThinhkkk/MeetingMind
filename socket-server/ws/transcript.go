package ws
import (
	"encoding/json"
	"errors"
)

type TranscriptWriter struct {
	Type        RESPONSE_TYPE          `json:"type"`
	IsEndOfTurn bool                   `json:"isEndOfTurn"`
	Words       []AssemblyResponseWord `json:"words"`
}

type TranscriptState struct {
	WordsTranscript chan (string)
	CurrentSentence []string
	NewWords        []AssemblyResponseWord
	CurrentTurnID   int
	EndOfTurn       bool
}

func NewTranscriptState() *TranscriptState {
	return &TranscriptState{
		WordsTranscript: make(chan string),
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

func (c *Client) addWordsTranscript(t string) *Client {
	c.Transcript.WordsTranscript <- t
	return c
}

func (c *Client) updateStateTranscript(jsonData []byte) error {
	var turn AssemblyRessponseTurn
	err := json.Unmarshal(jsonData, &turn)
	if err != nil {
		err1 := errors.New("cant parse json from Assembly: ")
		joinErr := errors.Join(err1, err)
		return joinErr
	}

	c.Transcript.NewWords = make([]AssemblyResponseWord, 0, 10)
	for index, assemblyWord := range turn.Words {

		c.Transcript.NewWords = append(c.Transcript.NewWords, assemblyWord)
		if !assemblyWord.WordIsFinal {
			continue
		}

		if index >= len(c.Transcript.CurrentSentence) {
			c.Transcript.CurrentSentence = append(c.Transcript.CurrentSentence, assemblyWord.Text)
			continue
		}

		if assemblyWord.Text != c.Transcript.CurrentSentence[index] {

			c.Transcript.CurrentSentence[index] = assemblyWord.Text

		}

	}

	c.Transcript.EndOfTurn = turn.EndOfTurn

	if turn.EndOfTurn {
		c.addWordsTranscript(turn.Transcript)
		c.Transcript.CurrentSentence = make([]string, 0, 10)
	}

	return nil

}
