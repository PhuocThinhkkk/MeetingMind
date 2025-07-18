package main

import (
    "fmt"
    "net/http"
    "log"
	"meetingmind-socket/ws"
	"github.com/joho/godotenv"
) 

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("env var didnt load successfully")
	}

    http.HandleFunc("/ws", ws.HandleWS)
    fmt.Println("WebSocket server started on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

