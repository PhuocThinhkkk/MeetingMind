package handler

import (
	"encoding/json"
	"meetingmind-socket/internal/config"
	"meetingmind-socket/internal/translation"
	"net/http"
)


func GetSupportedLanguagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", config.EnvVars.FrontendUrl)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	languages := translation.GetAllSupportLanguages()

	if err := json.NewEncoder(w).Encode(languages); err != nil {
		http.Error(w, "failed to encode languages", http.StatusInternalServerError)
		return
	}
}