package main

import (
	"database/sql"
	"log"
	"meetingmind-socket/internal/config"
	"meetingmind-socket/internal/database"
	"meetingmind-socket/internal/handler"
	"meetingmind-socket/internal/translation"
	"meetingmind-socket/internal/ws"
	"net/http"
)

func main() {

	postgres := setupAppService()
	defer postgres.Close()

	mux := http.NewServeMux()
	mux.Handle("/", handler.HealthCheck())
	mux.Handle("/ws", http.HandlerFunc(ws.RunServer))

	BIND_ADDR := getBindAddr()
	log.Println("WebSocket server started on :", config.EnvVars.Port)
	log.Fatal(http.ListenAndServe(BIND_ADDR+config.EnvVars.Port, mux))
}

func setupAppService() *sql.DB {
	config.CheckingAllEnvVars()
	database.Init()
	postgres, err := database.DB.DB()
	if err != nil {
		panic(err)
	}

	err = translation.Init()
	if err != nil {
		panic(err)
	}
	return postgres
}

func getBindAddr() string {
	Is_Prod := config.EnvVars.IS_PROD
	if !Is_Prod {
		return "0.0.0.0:"
	} 
	return ":"
}