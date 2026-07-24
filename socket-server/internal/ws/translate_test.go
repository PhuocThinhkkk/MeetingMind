package ws

import "testing"

func TestIsLanguageSupported(t *testing.T) {
    tests := []struct {
        lang string
        want bool
    }{
        {"en", true},
        {"vi", true},
        {"ja", true},
        {"ko", true},
        {"zh", true},
        {"fr", false},
        {"", false},
    }

    for _, tt := range tests {
        got := IsLanguageSupported(tt.lang)
        if got != tt.want {
            t.Errorf("IsLanguageSupported(%q) = %v, want %v",
                tt.lang, got, tt.want)
        }
    }
}

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