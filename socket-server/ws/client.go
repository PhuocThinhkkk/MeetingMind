package ws

import (
    "github.com/gorilla/websocket"
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"fmt"
)


type Client struct {
	Conn *websocket.Conn
	text  chan []byte
}



func RegisterClient(client *Client) {

    go client.readAudio()
    go client.writeText()

}

func (c *Client) readAudio() {
    defer func() {
        UnregisterClient(c)
    }()

    for {
        msgType, audio, err := c.Conn.ReadMessage()
        if err != nil {
            break
        }
		if msgType != websocket.BinaryMessage{
			fmt.Println("this is not a binary file")
			continue
		}
		transcribe(audio)
       
    }
}

func (c *Client) writeText() {
    for msg := range c.text{
        if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
            break
        }
    }
}

func transcribe(audio []byte) (string, error) {
	url := "https://api.openai.com/v1/audio/transcriptions"

	var b bytes.Buffer
	w := multipart.NewWriter(&b)

	fw, err := w.CreateFormFile("file", "audio.wav")
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(fw, bytes.NewReader(audio)); err != nil {
		return "", err
	}
	_ = w.WriteField("model", "whisper-1")
	w.Close()

	req, err := http.NewRequest("POST", url, &b)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer YOUR_OPENAI_API_KEY")
	req.Header.Set("Content-Type", w.FormDataContentType())

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	respBody, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	return string(respBody), nil
}

func UnregisterClient(c *Client) {
    c.Conn.Close()
    close(c.text)
}
