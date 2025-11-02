# WebSocket Backend (Socket Server)

This document describes the Go-based WebSocket server that handles real-time audio streaming and transcription.

## Overview

The socket server is written in Go and acts as a bridge between the Next.js frontend and the AssemblyAI real-time transcription service. It receives audio chunks from the client, forwards them to AssemblyAI, and streams back transcription results.

## Architecture

```

(binary chunk)→ Go Server (binary chunk)→   AssemblyAI WebSocket
                ↓        <-(transcript words)   
                ↓  → send transcript state to client
                →  process the translation (will implement) →send translate to client

```

## Directory Structure

```
socket-server/
├── main.go                    # Entry point
├── ws/                        # WebSocket package
│   ├── server.go              # WebSocket server setup
│   ├── handler.go             # WebSocket message handling
│   ├── client.go              # Client connection management
│   ├── assemblyConn.go        # AssemblyAI connection
│   ├── models.go              # Data models
│   ├── transcript.go          # Transcript processing
│   └── translate.go           # Translation handling
├── client/                    # Test client
│   └── main.go
├── Dockerfile                 # Container configuration
├── .env.example               # Environment template
├── go.mod                     # Go dependencies
└── go.sum                     # Dependency checksums
```

## Server Setup (`main.go`)

The main server initializes on a configurable port and provides two endpoints:

```go
http.HandleFunc("/", healthCheck)      // Health check endpoint
http.HandleFunc("/ws", ws.RunServer)   // WebSocket endpoint
```

### Configuration

Environment variables are loaded from `.env` file:
- `PORT` - Server port (default: 9090)
- `FRONTEND_URL` - Allowed CORS origin
- `ASSEMBLYAI_API_KEY` - AssemblyAI API key (required)
- `IS_PROD` - Production mode flag

### Binding Address
- Development (`IS_PROD` empty or not "true"): Binds to `0.0.0.0:PORT`
- Production (`IS_PROD=true`): Binds to `:PORT`

## WebSocket Endpoints

### Health Check
```
GET /
Response: "server is good"
```

### WebSocket Connection
```
WS /ws
```

Establishes a bidirectional WebSocket connection for audio streaming and transcription.

## Data Models (`ws/models.go`)

### Response Types
```go
const (
    TRANSCRIPT_RESPONSE = "transcript"
    TRANSLATE_RESPONSE  = "translate"
)
```

### AssemblyResponseWord
```go
type AssemblyResponseWord struct {
    Start       int     `json:"start"`
    End         int     `json:"end"`
    Text        string  `json:"text"`
    Confidence  float64 `json:"confidence"`
    WordIsFinal bool    `json:"word_is_final"`
}
```

### AssemblyRessponseTurn
```go
type AssemblyRessponseTurn struct {
    TurnOrder           int                    `json:"turn_order"`
    Transcript          string                 `json:"transcript"`
    EndOfTurn           bool                   `json:"end_of_turn"`
    EndOfTurnConfidence float64                `json:"end_of_turn_confidence"`
    Words               []AssemblyResponseWord `json:"words"`
    Type                string                 `json:"type"`
}
```

### Error Handling
- Maximum error count: `MaxErr = 10`
- Connection closed after reaching max errors
- Graceful cleanup on disconnection

## Message Types

### Client → Server
- **Binary Messages** - Raw PCM audio data (int16, 16kHz, mono)
- Chunks should be 1800 bytes (900 samples, ~56.25ms)

### Server → Client
- **Transcript Messages** - JSON with partial/final transcription
- **Translate Messages** - Translation results (if enabled)

## CORS Configuration

The server checks origin for WebSocket connections:
```go
CheckOrigin: func(r *http.Request) bool {
    if testing {
        return true  // Allow all origins in dev
    }
    frontendUrl := os.Getenv("FRONTEND_URL")
    origin := r.Header.Get("Origin")
    return origin == frontendUrl
}
```

## Running the Server

### Local Development
```bash
cd socket-server
cp .env.example .env
# Edit .env with your credentials
go run main.go
```

### Using Docker
```bash
cd socket-server
docker build -t meetingmind-socket .
docker run --env-file .env -p 9090:9090 meetingmind-socket
```

## Environment Variables

Create a `.env` file in the `socket-server/` directory:
```env
PORT=9090
FRONTEND_URL=http://localhost:3000
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
IS_PROD=false
```

## Dependencies

Key dependencies (from `go.mod`):
- `github.com/gorilla/websocket` - WebSocket implementation
- `github.com/joho/godotenv` - Environment variable loading

Install with:
```bash
go mod download
```

## Testing

A test client is available in `client/main.go` for debugging the WebSocket connection.

## Production Deployment

1. Set `IS_PROD=true` in environment
2. Configure `FRONTEND_URL` to your production domain
3. Use proper process manager (systemd, Docker, etc.)
4. Implement proper logging and monitoring
5. Use reverse proxy (nginx, Caddy) for SSL termination

## Performance Considerations

- Each client maintains two WebSocket connections (client ↔ server, server ↔ AssemblyAI)
- Audio chunks are buffered in memory
- Connection cleanup on errors or disconnection
- Consider connection limits and resource monitoring

## Related Documentation

- [Real-time Transcription](./real-time-transcription.md)
- [Architecture](./architecture.md)
- [Setup](./setup.md)


