package validation

import (
    "errors"
    "github.com/golang-jwt/jwt/v5"
)

func ValidateSupabaseJWT(tokenString string, secret string) (string, error) {

    token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, errors.New("unexpected signing method")
        }
        return []byte(secret), nil
    })

    if err != nil || !token.Valid {
        return "", errors.New("invalid jwt")
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return "", errors.New("invalid claims")
    }

    supabaseUserId, ok := claims["sub"].(string)
    if !ok {
        return "", errors.New("no sub in token")
    }

    return supabaseUserId, nil
}

