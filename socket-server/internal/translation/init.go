package translation

import (
	"context"

	translate "cloud.google.com/go/translate/apiv3"
)

var translateClient *translate.TranslationClient

// Init initializes the package's Google Cloud Translation client.
// It returns an error if the client cannot be created.
func Init() error {
    client, err := translate.NewTranslationClient(context.Background())
    if err != nil {
        return err
    }

    translateClient = client
    return nil
}