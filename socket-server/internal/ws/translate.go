package ws

import (
	"fmt"
	"log"
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
func Translate(language string, words []AssemblyResponseWord) (string, error) {
	// TODO: Implement actual translation logic here.
	var textBuilder []string
	for _, word := range words {
		textBuilder = append(textBuilder, word.Text)
	}

	res := strings.Join(textBuilder, " ")
	log.Printf("Placeholder Translate called for language: %s, words: %d. Returning: %s\n", language, len(words), res)
	return res, nil
}
