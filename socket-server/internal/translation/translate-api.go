package translation

import (
	"context"
	"fmt"

	translatepb "cloud.google.com/go/translate/apiv3/translatepb"
)

const projectID = "turing-zone-468913-g8"

func TranslateText(text, sourceLang, targetLang string) (string, error) {
    req := &translatepb.TranslateTextRequest{
        Parent:             "projects/" + projectID + "/locations/global",
        Contents:           []string{text},
        MimeType:           "text/plain",
        SourceLanguageCode: sourceLang,
        TargetLanguageCode: targetLang,
    }

    resp, err := translateClient.TranslateText(context.Background(), req)
    if err != nil {
        return "", err
    }

	if resp == nil || len(resp.Translations) == 0 {
		return "", fmt.Errorf("translation API returned no translations")
	}
	return resp.Translations[0].TranslatedText, nil
}