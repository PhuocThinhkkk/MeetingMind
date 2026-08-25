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

// main initializes application services and starts the HTTP server with health-check and WebSocket routes.
func main() {

	postgres := setupAppService()
	defer postgres.Close()

	mux := http.NewServeMux()
	mux.Handle("/", handler.HealthCheck())
	mux.HandleFunc("/translate/get-all-languages", handler.GetSupportedLanguagesHandler)
	mux.Handle("/ws", http.HandlerFunc(ws.RunServer))

	BIND_ADDR := getBindAddr()
	log.Println("WebSocket server started on :", config.EnvVars.Port)
	log.Fatal(http.ListenAndServe(BIND_ADDR+config.EnvVars.Port, mux))
}

// setupAppService validates the application environment and initializes the database and translation services.
// It returns the application's SQL database handle and panics if database access or translation initialization fails.
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

// getBindAddr returns the bind address prefix based on the production environment setting.
func getBindAddr() string {
	Is_Prod := config.EnvVars.IS_PROD
	if !Is_Prod {
		return "0.0.0.0:"
	} 
	return ":"
}