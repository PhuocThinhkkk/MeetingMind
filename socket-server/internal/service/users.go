package service

import (
	"context"
	"meetingmind-socket/internal/app"
	"meetingmind-socket/internal/models"
	"meetingmind-socket/internal/database"
)


func GetUserById(app app.App,ctx context.Context, userId string) (models.User, error) {

	var user models.User

    result := database.DB.WithContext(ctx).Where("id = ?", userId).First(&user)
    if result.Error != nil {
        return user, result.Error
    }
	return user, nil


}
