package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type AppEnvVars struct {
	Port              string
	FrontendUrl       string
	AssemblyApiKey    string
	SupabaseJwtKey    string
	DatabaseConnection string
	IS_PROD        bool
}

var EnvVars *AppEnvVars

// CheckingAllEnvVars loads and validates the required environment variables, then
// populates EnvVars with the resulting configuration. It loads a .env file when
// PORT is initially unavailable and terminates the program if loading fails or a
// required variable is missing.
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
	supabaseJwtKey := os.Getenv("SUPABASE_JWT_KEY")
	databaseConnection := os.Getenv("DATABASE_URL")
	is_prod := getIsProdBool(os.Getenv("IS_PROD"))

	if port == "" {
		log.Fatal("fail to load PORT in env")
	}
	if frontendUrl == "" {
		log.Fatal("fail to load FRONTEND_URL in env")
	}
	if assemblyApiKey == "" {
		log.Fatal("fail to load ASSEMBLYAI_API_KEY in env")
	}
	if supabaseJwtKey == "" {
		log.Fatal("fail to load SUPABASE_JWT_KEY in env")
	}
	if databaseConnection == "" {
		log.Fatal("fail to load DATABASE_URL in env")
	}
	

	EnvVars = &AppEnvVars{
		Port:              port,
		FrontendUrl:       frontendUrl,
		AssemblyApiKey:    assemblyApiKey,
		SupabaseJwtKey:    supabaseJwtKey,
		DatabaseConnection: databaseConnection,
		IS_PROD: is_prod,
	}

}


// getIsProdBool converts an IS_PROD environment value to a boolean.
// It returns true when the value is "true", ignoring letter case, and false for
// empty or any other value.
func getIsProdBool(is_prod_string string) bool {
	is_prod_lower := strings.ToLower(is_prod_string)
	if is_prod_lower == "" {
		log.Println("no IS_PROD var found in env, use IS_PROD=false by defaule.")
		return false
	} else if is_prod_lower == "true" {
		return true
	}
	return false
}