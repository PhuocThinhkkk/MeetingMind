package ws

import (
	"fmt"
	"log"
	"meetingmind-socket/internal/translation"
	"strings"
)

var SupportedLanguages = map[string]bool{
    "en": true,
    "vi": true,
    "ja": true,
    "ko": true,
    "zh": true,
}

func IsLanguageSupported(lang string) bool {
    return SupportedLanguages[lang]
}

type CurrentTranslationConfig struct {
	FromLang     string
	ToLang       string
}

type TranslateState struct {
	CurrentConfig  CurrentTranslationConfig
	Sentences      string
} 

func NewTranslationState(toLang string) (*TranslateState, error) {

	if !IsLanguageSupported(toLang) {
		return nil, fmt.Errorf("unsupported language: %s", toLang)
	}
	return &TranslateState{
		Sentences: "",
		CurrentConfig: CurrentTranslationConfig{FromLang: "en", ToLang: toLang},
	}, nil
}

// Translate is a placeholder function for translation.
// It should be replaced with actual translation logic.
func Translate(sLang string, tLang string, words []AssemblyResponseWord) (string, error) {
	// TODO: Implement actual translation logic here.
	textParts := make([]string, 0, len(words))
	for _, word := range words {
		textParts = append(textParts, word.Text)
	}
	textBuilder := strings.Join(textParts, " ")

	res, err := translation.TranslateText(textBuilder, sLang, tLang)
	if err != nil {
		log.Printf("Error translate text: %s to lang: %s", textBuilder, tLang)
		return res, err
	}

	log.Printf("Placeholder Translate called for language: %s, words: %d. Returning: %d \n", tLang, len(words), len(res))
	return res, nil
}
