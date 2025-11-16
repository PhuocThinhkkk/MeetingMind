package middleware

import (
    "net/http"

    "golang.org/x/time/rate"
)

var clients = make(map[string]*rate.Limiter)

func getLimiter(ip string) *rate.Limiter {
    if limiter, exists := clients[ip]; exists {
        return limiter
    }
    limiter := rate.NewLimiter(1, 5) // 1 request/sec, burst 5
    clients[ip] = limiter
    return limiter
}

func RateLimit(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        limiter := getLimiter(ip)

        if !limiter.Allow() {
            http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
            return
        }

        next.ServeHTTP(w, r)
    })
}

