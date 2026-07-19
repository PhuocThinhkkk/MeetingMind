package ws

import "time"

var MaxErr = 10

type RESPONSE_TYPE string

const (
	TRANSCRIPT_RESPONSE RESPONSE_TYPE = "transcript"
	TRANSLATE_RESPONSE  RESPONSE_TYPE = "translate"
)

type AssemblyResponseWord struct {
	Start       int     `json:"start"`
	End         int     `json:"end"`
	Text        string  `json:"text"`
	Confidence  float64 `json:"confidence"`
	WordIsFinal bool    `json:"word_is_final"`
}

type AssemblyRessponseTurn struct {
	TurnOrder           int                    `json:"turn_order"`
	Transcript          string                 `json:"transcript"`
	EndOfTurn           bool                   `json:"end_of_turn"`
	EndOfTurnConfidence float64                `json:"end_of_turn_confidence"`
	Words               []AssemblyResponseWord `json:"words"`
	Type                string                 `json:"type"`
}

// TranscriptEvent represents a single transcript update event.
type TranscriptEvent struct {
	TurnId           string                 `json:"turn_id,omitempty"`
	Text             string                 `json:"text,omitempty"`
	IsFinal          bool                   `json:"is_final,omitempty"`
	Confidence       float64                `json:"confidence,omitempty"`
	Words            []AssemblyResponseWord `json:"words,omitempty"`
	AssemblyMetadata map[string]interface{} `json:"assembly_metadata,omitempty"` // For any other useful AssemblyAI metadata
	Timestamp        time.Time              `json:"timestamp,omitempty"`
}

// TranscriptWriter is used to send transcript events over websocket.
type TranscriptWriter struct {
	Type  RESPONSE_TYPE   `json:"type"`
	Event TranscriptEvent `json:"event"`
}

// TranslateWriter is used to send translated events over websocket.
type TranslateWriter struct {
	Type           RESPONSE_TYPE   `json:"type"`
	Event          TranscriptEvent `json:"event"`
	Language       string          `json:"language"`
	TranslatedText string          `json:"translated_text"`
}
