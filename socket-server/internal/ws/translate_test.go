package ws

import (
	"testing"
)



func TestNewTranslationState(t *testing.T) {
    state, err := NewTranslationState("vi")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if state.CurrentConfig.ToLang != "vi" {
        t.Errorf("expected ToLang=vi, got %s", state.CurrentConfig.ToLang)
    }

    if state.CurrentConfig.FromLang != "en" {
        t.Errorf("expected FromLang=en, got %s", state.CurrentConfig.FromLang)
    }

    if state.Sentences != "" {
        t.Errorf("expected empty sentence")
    }
}