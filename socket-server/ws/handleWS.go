package ws

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var testing = true

var upgrader = websocket.Upgrader{

	CheckOrigin: func(r *http.Request) bool {
		if testing {
			return true
		}
		frontendUrl := os.Getenv("FRONTEND_URL")
		origin := r.Header.Get("Origin")
		return origin == frontendUrl
	},
}

func HandleWS(w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming request:", r.Method, r.URL.Path)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	fmt.Println("new user connect to server")

	assemblyAIKey := os.Getenv("ASSEMBLYAI_API_KEY")
	if assemblyAIKey == "" {
		log.Fatal("must have assembly api key")
	}
	assemblyConn, res, err := ConnectToAssemblyAI(assemblyAIKey)
	if err != nil {
		log.Println("AssemblyRes : ", res)
		log.Fatal("WebSocket dial error:", err)
	}

	client := NewClient(conn, assemblyConn)

	RegisterClient(client)
}
