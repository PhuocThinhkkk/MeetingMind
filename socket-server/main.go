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
		fmt.Fprint(w, "server is good")
	})
	http.HandleFunc("/ws", ws.HandleWS)

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
