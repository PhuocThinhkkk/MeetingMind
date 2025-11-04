package main

import (
	"fmt"
	"log"
	"meetingmind-socket/ws"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("env var didnt load successfully")
		}
		port = os.Getenv("PORT")
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
	http.HandleFunc("/ws", ws.RunServer)

	fmt.Println("WebSocket server started on :", port)
	Is_Prod := os.Getenv("IS_PROD")
	var BIND_ADDR string
	if Is_Prod == "" {
		BIND_ADDR = "0.0.0.0:"
	} else if Is_Prod == "true" {
		BIND_ADDR = ":"
	} else {
		BIND_ADDR = "0.0.0.0:"
	}
	log.Fatal(http.ListenAndServe(BIND_ADDR+port, nil))
}
