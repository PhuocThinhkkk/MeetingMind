package translation

import (
	"testing"
)

func TestIsLanguageSupported(t *testing.T) {
    tests := []struct {
        lang string
        want bool
    }{
        {"en", false},
        {"vi", true},
        {"ja", true},
        {"ko", true},
        {"zh-CN", true},
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