package ws

import (
	"net/http"
	"encoding/json"
	"io"
	"github.com/gorilla/websocket"
	"log"
	"fmt"
)
var TimeConsume = 60 // 1 min

func ConnectToAssemblyAI(apiKey string) (*websocket.Conn, *http.Response, error) {
	
	token, err := getStreamingToken(apiKey, TimeConsume)
	if err != nil {
		log.Fatal("err when getStreaming token: ", err)
	}

	wsURL := "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=" + token
	conn, resp, err := websocket.DefaultDialer.Dial(wsURL, nil)

	if resp.StatusCode != 101 { 
		return nil, resp, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return conn, resp, err
}

type ResponseAssemblyToken struct {
	Token            string `json:"token"`
	ExpiresInSeconds int    `json:"expires_in_seconds"`
}

func getStreamingToken(apiKey string, expiredTime int) (string, error) {
    baseURL := "https://streaming.assemblyai.com/v3/token?expires_in_seconds=" + fmt.Sprint(expiredTime)

    req, err := http.NewRequest("GET", baseURL, nil)
    if err != nil {
        return "", fmt.Errorf("failed to create request: %w", err)
    }
    req.Header.Set("Authorization", apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", fmt.Errorf("failed to do request: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        bodyBytes, _ := io.ReadAll(resp.Body)
        return "", fmt.Errorf("non-200 response: %d - %s", resp.StatusCode, string(bodyBytes))
    }

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", fmt.Errorf("failed to read response body: %w", err)
    }

    var result ResponseAssemblyToken
    if err := json.Unmarshal(body, &result); err != nil {
        return "", fmt.Errorf("failed to parse JSON response: %w\nResponse body: %s", err, string(body))
    }

	fmt.Println(result)
    return result.Token, nil
}
