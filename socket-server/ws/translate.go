package ws

type TranslateWriter struct {
	Type  RESPONSE_TYPE `json:"type"`
	Words string        `json:"words"`
}

func NewTranslateWriter(word string) *TranslateWriter {
	return &TranslateWriter{
		Type:  TRANSLATE_RESPONSE,
		Words: word,
	}
}
