package handler

import (
	"net/http"
	"os"
	"log"
	"fmt"
)

func HealthCheck() http.HandlerFunc{
	return (func(w http.ResponseWriter, r *http.Request) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			log.Println("havent set FRONTEND_URL in env, using http://localhost as defaule")
			frontendURL = "http://localhost:3000"
		}
		w.Header().Set("Access-Control-Allow-Origin", frontendURL)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		fmt.Fprint(w, "server is good")
	})
}
