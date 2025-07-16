package ws

import (
	"log"
	"net/http"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func HandleWS(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Upgrade error:", err)
        return
    }
    defer conn.Close()

	client = &Client{
		conn,
		text: make(chan []byte)
	}

	RegisterClient(client)
}
