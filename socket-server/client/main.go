
package main

import (
    "log"
    "time"
    "github.com/gorilla/websocket"
)

const (
	SampleRate = 16000
	ChunkMS    = 50 // ms
)


func RunClient() {
    conn, _, err := websocket.DefaultDialer.Dial("ws://localhost:8080/ws", nil)
    if err != nil {
        log.Fatal("dial:", err)
    }
    defer conn.Close()

    silence := make([]byte, SampleRate*2*ChunkMS/1000)
    for {
        // fill silence with zeros is fine
        if err := conn.WriteMessage(websocket.BinaryMessage, silence); err != nil {
            log.Println("Write error:", err)
            return
        }
        time.Sleep(ChunkMS * time.Millisecond)
    }
}

func main() {
	RunClient()
}
