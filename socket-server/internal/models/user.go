package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type User struct {
	ID              uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email           string         `gorm:"type:text" json:"email"`
	Name            string         `gorm:"type:text" json:"name"`
	GoogleAuthToken string         `gorm:"type:text" json:"-"`
	Settings        datatypes.JSON `gorm:"type:jsonb" json:"settings"`

	CreatedAt time.Time `gorm:"type:timestamptz;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"type:timestamptz;autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
