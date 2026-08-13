package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sort"
	"time"

	translate "cloud.google.com/go/translate/apiv3"
	translatepb "cloud.google.com/go/translate/apiv3/translatepb"
	"github.com/joho/godotenv"
)

const projectID = "turing-zone-468913-g8"

func main() {
	envPath := ".env"

	if err := godotenv.Load(envPath); err != nil {
		log.Fatalf("failed to load %s: %v", envPath, err)
	}

	credentials := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	if credentials == "" {
		log.Fatal("GOOGLE_APPLICATION_CREDENTIALS is not set")
	}

	fmt.Println("Using credentials:", credentials)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := translate.NewTranslationClient(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	req := &translatepb.GetSupportedLanguagesRequest{
		Parent:              "projects/" + projectID + "/locations/global",
		DisplayLanguageCode: "en",
	}

	resp, err := client.GetSupportedLanguages(ctx, req)
	if err != nil {
		log.Fatal(err)
	}

	supportedLanguages := make([]*translatepb.SupportedLanguage, 0, len(resp.Languages))
	for _, lang := range resp.Languages {
		if lang.GetSupportTarget() {
			supportedLanguages = append(supportedLanguages, lang)
		}
	}
	resp.Languages = supportedLanguages

	sort.Slice(resp.Languages, func(i, j int) bool {
		return resp.Languages[i].LanguageCode <
			resp.Languages[j].LanguageCode
	})

	fmt.Println("var AvailableLanguages = []Language{")

	for _, lang := range resp.Languages {
		fmt.Printf(
			"\t{Code: %q, Name: %q},\n",
			lang.LanguageCode,
			lang.DisplayName,
		)
	}

	fmt.Println("}")
}