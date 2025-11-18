package ws

import (
	"log"
	"meetingmind-socket/internal/validation"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var testing = os.Getenv("IS_USING_CLIENT_TEST")

var upgrader = websocket.Upgrader{

	CheckOrigin: func(r *http.Request) bool {
		if testing == "true" {
			return true
		}
		frontendUrl := os.Getenv("FRONTEND_URL")
		origin := r.Header.Get("Origin")
		return origin == frontendUrl
	},
}

func RunServer(w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming request:", r.Method, r.URL.Path)

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", 401)
		log.Println("Missing token in request")
		return
	}

	userId, err := validation.ValidateSupabaseJWT(token, os.Getenv("SUPABASE_JWT_KEY"))
	if err != nil {
		http.Error(w, "invalid token", 401)
		log.Println("Invalid token:", err)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		// no need to write an error response here, as the upgrade has already failed
		return
	}

	assemblyAIKey := os.Getenv("ASSEMBLYAI_API_KEY")
	assemblyConn, res, err := ConnectToAssemblyAI(assemblyAIKey)
	if err != nil {

		log.Println("Assembly Error : ", res)
		conn.WriteJSON(map[string]string{
			"type":    "error",
			"message": "Server can't transcript right now",
		})
		conn.Close()
		if assemblyConn != nil {
			assemblyConn.Close()
		}

		return
	}

	client := NewClient(userId, conn, assemblyConn)

	RegisterClient(client)
}
