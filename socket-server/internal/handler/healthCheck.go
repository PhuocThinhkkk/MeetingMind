package handler

import (
	"fmt"
	"meetingmind-socket/internal/config"
	"net/http"
)

func HealthCheck() http.HandlerFunc{
	return (func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", config.EnvVars.FrontendUrl)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		fmt.Fprint(w, "server is good")
	})
}
