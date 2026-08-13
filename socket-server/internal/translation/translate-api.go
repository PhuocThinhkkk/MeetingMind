package translation

import (
	"context"
	"fmt"
	"time"

	translatepb "cloud.google.com/go/translate/apiv3/translatepb"
)

const projectID = "turing-zone-468913-g8"

// TranslateText translates text from the source language to the target language.
// It returns the first translated result or an error if the translation request
// fails or produces no translations.
func TranslateText(text, sourceLang, targetLang string) (string, error) {
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