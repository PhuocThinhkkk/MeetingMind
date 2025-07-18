package ws

import (
	"log"
	"net/http"
	"fmt"
    "github.com/gorilla/websocket"
	"os"
)
var upgrader = websocket.Upgrader{}

func HandleWS(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Upgrade error:", err)
        return
    }
	fmt.Println("new user connect to server")
    defer conn.Close()

	assemblyAIKey := os.Getenv("ASSEMBLYAI_API_KEY")
	if assemblyAIKey == "" {
		log.Fatal("must have assembly api key")
	}
	assemblyConn, res, err := ConnectToAssemblyAI(assemblyAIKey)
	if err != nil {
		log.Fatal("WebSocket dial error:", err)
	}
	fmt.Print("res ", res)
	defer assemblyConn.Close()

	client := &Client{
		Conn : conn,
		Text: make(chan []byte),
		AssemblyConn : assemblyConn,
	}

	RegisterClient(client)
}

