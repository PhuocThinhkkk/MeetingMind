package translation

import (
	"context"

	translate "cloud.google.com/go/translate/apiv3"
)

var TranslateClient *translate.TranslationClient

func Init() error {
    client, err := translate.NewTranslationClient(context.Background())
    if err != nil {
        return err
    }

    TranslateClient = client
    return nil
}