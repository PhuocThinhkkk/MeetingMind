package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func CheckingAllEnvVars() {
	port := os.Getenv("PORT")
	if port == "" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("env var didnt load successfully")
		}
		port = os.Getenv("PORT")
	}
	frontendUrl := os.Getenv("FRONTEND_URL")
	assemblyApiKey := os.Getenv("ASSEMBLYAI_API_KEY")

	if port == "" {
		log.Fatal("fail to load PORT in env")
	}
	if frontendUrl == "" {
		log.Fatal("fail to load FRONTEND_URL in env")
	}
	if assemblyApiKey == "" {
		log.Fatal("fail to load ASSEMBLYAI_API_KEY in env")
	}

}



