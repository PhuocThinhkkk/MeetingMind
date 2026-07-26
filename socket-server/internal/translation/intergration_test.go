package translation

import (
	"testing"

	"github.com/joho/godotenv"
)

func TestTranslateText_Integration(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test")
    }

	 if err := godotenv.Load("../../.env"); err != nil {
        t.Fatal(err)
    }

    if err := Init(); err != nil {
        t.Fatal(err)
    }
    defer translateClient.Close()

    got, err := TranslateText("Hello world", "en", "vi")
    if err != nil {
        t.Fatal(err)
    }

    if got == "" {
        t.Fatal("expected translated text")
    }

    t.Logf("translation: %s", got)
}