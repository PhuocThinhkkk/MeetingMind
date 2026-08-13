package translation

import (
	"context"
	"fmt"
	"time"

	translatepb "cloud.google.com/go/translate/apiv3/translatepb"
)

const projectID = "turing-zone-468913-g8"

type Language struct {
	Code string
	Name string
}

var supportedLanguages = []Language{
	// {Code: "en", Name: "English"},
	{Code: "vi", Name: "Vietnamese"},
	{Code: "zh-CN", Name: "Chinese (Simplified)"},
	{Code: "zh-TW", Name: "Chinese (Traditional)"},
	{Code: "ja", Name: "Japanese"},
	{Code: "ko", Name: "Korean"},
	{Code: "es", Name: "Spanish"},
	{Code: "fr", Name: "French"},
	{Code: "de", Name: "German"},
	{Code: "it", Name: "Italian"},
	{Code: "id", Name: "Indonesian"},
	{Code: "th", Name: "Thai"},
	{Code: "ar", Name: "Arabic"},
	{Code: "hi", Name: "Hindi"},
}

var supportedLanguageCodes = func() map[string]struct{} {
	result := make(map[string]struct{}, len(supportedLanguages))

	for _, lang := range supportedLanguages {
		result[lang.Code] = struct{}{}
	}

	return result
}()

func IsLanguageSupported(code string) bool {
	_, ok := supportedLanguageCodes[code]
	return ok
}

func GetAllSupportLanguages()[]Language{
    return supportedLanguages
}



// TranslateText translates text from the source language to the target language.
// It returns the first translated result or an error if the translation request
// fails or produces no translations.
func TranslateText(text, sourceLang, targetLang string) (string, error) {

    if !IsLanguageSupported(targetLang) {
		return "", fmt.Errorf("unsupported language: %s", targetLang)
	}
    req := &translatepb.TranslateTextRequest{
        Parent:             "projects/" + projectID + "/locations/global",
        Contents:           []string{text},
        MimeType:           "text/plain",
        SourceLanguageCode: sourceLang,
        TargetLanguageCode: targetLang,
    }

    ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
    defer cancel()
    resp, err := translateClient.TranslateText(ctx, req)
    if err != nil {
        return "", err
    }

	if resp == nil || len(resp.Translations) == 0 {
		return "", fmt.Errorf("translation API returned no translations")
	}
	return resp.Translations[0].TranslatedText, nil
}