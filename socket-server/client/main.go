package main

import (
    "log"
    "os"
    "time"
    "path/filepath"
    "runtime"
    "github.com/gorilla/websocket"
)

const (
    SampleRate = 16000
    ChunkMS    = 50 // ms
    ChunkSize  = SampleRate * 2 * ChunkMS / 1000 // 1600 bytes
)

func getCurrentDir() string {
    _, filename, _, ok := runtime.Caller(0)
    if !ok {
        log.Fatal("unable to get current file path")
    }
    return filepath.Dir(filename)
}

func RunClient() {
    conn, _, err := websocket.DefaultDialer.Dial("ws://localhost:8080/ws", nil)
    if err != nil {
        log.Fatal("dial:", err)
    }
    defer conn.Close()

	wd := getCurrentDir()
	log.Println("Current working dir:", wd)
	
    file, err := os.ReadFile(wd + "/hello.pcm")
    if err != nil {
        log.Fatal("failed to read PCM file:", err)
    }

	for{ 
		for i := 0; i < len(file); i += ChunkSize { 
			end := i + ChunkSize
			if end > len(file) {
				end = len(file)
			}

			chunk := file[i:end]
			if len(chunk) < ChunkSize {
				padded := make([]byte, ChunkSize)
				copy(padded, chunk)
				chunk = padded
			}
			log.Printf("Sending chunk of size %d bytes", len(chunk))
			if err := conn.WriteMessage(websocket.BinaryMessage, chunk); err != nil {
				log.Println("Write error:", err)
				return
			}

			time.Sleep(ChunkMS * time.Millisecond)
		}

	}
}

func main() {
    RunClient()
}

