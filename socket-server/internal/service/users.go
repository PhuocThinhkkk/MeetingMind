package service

import (
	"context"
	"meetingmind-socket/internal/models"
	"meetingmind-socket/internal/database"
)


func GetUserById(ctx context.Context, userId string) (models.User, error) {

	var user models.User

    result := database.DB.WithContext(ctx).Where("id = ?", userId).First(&user)
    if result.Error != nil {
        return models.User{}, result.Error
    }
	return user, nil


}
