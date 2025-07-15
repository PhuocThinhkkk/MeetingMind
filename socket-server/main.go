package main

import (
    "fmt"
    "net/http"
    "log"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func handleWS(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Upgrade error:", err)
        return
    }
    defer conn.Close()

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            log.Println("Read error:", err)
            break
        }
        log.Println("Received:", string(msg))
        conn.WriteMessage(websocket.TextMessage, []byte("Echo: "+string(msg)))
    }
}

func main() {
    http.HandleFunc("/ws", handleWS)
    fmt.Println("WebSocket server started on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

