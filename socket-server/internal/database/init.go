package database

import (
	"meetingmind-socket/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Init establishes the PostgreSQL database connection and stores it in DB.
// It panics if the connection cannot be opened.
func Init() {
	dsn := config.EnvVars.DatabaseConnection
	conn, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	DB = conn
}
