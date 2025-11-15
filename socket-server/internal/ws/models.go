package ws

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

