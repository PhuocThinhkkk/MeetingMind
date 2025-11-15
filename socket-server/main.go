package main

import (
	"fmt"
	"log"
	"meetingmind-socket/internal/config"
	"meetingmind-socket/internal/handler"
	"meetingmind-socket/internal/ws"
	"net/http"
	"os"
)

func main() {
	config.CheckingAllEnvVars()

	http.HandleFunc("/", handler.HealthCheck())
	http.HandleFunc("/ws", ws.RunServer)


	port := os.Getenv("PORT")
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
