package translation

import (
	"context"
	"log"
	"os"

	translate "cloud.google.com/go/translate/apiv3"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

var translateClient *translate.TranslationClient

func Init() error {
	ctx := context.Background()

	var client *translate.TranslationClient
	var err error

	credentialsJSON := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

	if credentialsJSON != "" {
		// Render: service-account JSON stored in environment variable.
		jwtConfig, err := google.JWTConfigFromJSON(
			[]byte(credentialsJSON),
			"https://www.googleapis.com/auth/cloud-translation",
		)
		if err != nil {
			return err
		}

		client, err = translate.NewTranslationClient(
			ctx,
			option.WithTokenSource(jwtConfig.TokenSource(ctx)),
		)
	} else {
		// Local: use GOOGLE_APPLICATION_CREDENTIALS through ADC.
        log.Println("No credentials for google translation found. Use local path for development. ")
		client, err = translate.NewTranslationClient(ctx)
	}

	if err != nil {
		return err
	}

	translateClient = client

	log.Println("All languages supports for translate:", supportedLanguages)

	return nil
}