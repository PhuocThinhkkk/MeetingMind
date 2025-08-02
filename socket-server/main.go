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

	http.HandleFunc("/ws", ws.HandleWS)
	fmt.Println("WebSocket server started on :", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
