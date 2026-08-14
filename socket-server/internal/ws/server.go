package ws

import (
	"log"
	"meetingmind-socket/internal/config"
	"meetingmind-socket/internal/validation"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var is_test_by_audio_file = os.Getenv("IS_USING_CLIENT_TEST")

var upgrader = websocket.Upgrader{

	CheckOrigin: func(r *http.Request) bool {
		if is_test_by_audio_file == "true" {
			return true
		}
		frontendUrl := os.Getenv("FRONTEND_URL")
		origin := r.Header.Get("Origin")
		return origin == frontendUrl
	},
}

// RunServer authenticates an HTTP request and establishes a client connection for audio transcription.
// It responds with HTTP 401 when the token is missing or invalid and closes connections when setup fails.
func RunServer(w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming request:", r.Method, r.URL.Path)

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", 401)
		log.Println("Missing token in request")
		return
	}

	userId, err := validation.ValidateSupabaseJWT(token, config.EnvVars.SupabaseJwtKey)
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
		writeClientError(err, conn, "Server can not transcribe audio right now", false)
		handleCloseConns(conn, assemblyConn)
		return
	}

	client, err := NewClient(userId, conn, assemblyConn)
	if err != nil {
		log.Println("New Client Error : ", err)
		writeClientError(err, conn, "", true)
		handleCloseConns(conn, assemblyConn)
		return
	}

	RegisterClient(client)
}

// writeClientError sends an error message over the WebSocket connection when one is available.
// It uses err's message when send is true and clientMessage otherwise.
func writeClientError(err error, conn *websocket.Conn, clientMessage string, send bool) {
	if conn == nil {
		log.Println("No connection found to write error!")
		return
	}

	if send {
		eJson := conn.WriteJSON(map[string]string{
			"type":    "error",
			"message": err.Error(),
		})

		if eJson != nil {
    		log.Println("Failed to write error:", eJson)
		}
		return
	}

	_ = conn.WriteJSON(map[string]string{
		"type":    "error",
		"message": clientMessage,
	})
}

// handleCloseConns closes the client and AssemblyAI WebSocket connections when they are present.
func handleCloseConns(conn *websocket.Conn, assemblyConn *websocket.Conn){
	if conn != nil {
		conn.Close()
	}
	if assemblyConn != nil {
		assemblyConn.Close()
	}
}