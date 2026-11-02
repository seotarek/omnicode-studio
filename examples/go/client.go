// Package main provides an idiomatic Go client for the OmniCode REST API.
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		BaseURL: baseURL,
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type QrRequest struct {
	Data                 string `json:"data"`
	ErrorCorrectionLevel string `json:"ecLevel,omitempty"`
	Size                 int    `json:"size,omitempty"`
	DotType              string `json:"dotType,omitempty"`
	FgColor              string `json:"fgColor,omitempty"`
	BgColor              string `json:"bgColor,omitempty"`
}

type BarcodeRequest struct {
	Format       string `json:"format"`
	Data         string `json:"data"`
	Style        string `json:"style,omitempty"`
	Width        int    `json:"width,omitempty"`
	Height       int    `json:"height,omitempty"`
	HeaderText   string `json:"headerText,omitempty"`
	FooterText   string `json:"footerText,omitempty"`
	DisplayValue bool   `json:"displayValue,omitempty"`
}

type CodeResponse struct {
	Success bool   `json:"success"`
	Format  string `json:"format"`
	Svg     string `json:"svg"`
	Error   string `json:"error,omitempty"`
}

func (c *Client) GenerateQR(req QrRequest) (*CodeResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL+"/api/v1/generate/qr", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		httpReq.Header.Set("x-api-key", c.APIKey)
	}

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var codeResp CodeResponse
	if err := json.Unmarshal(respBytes, &codeResp); err != nil {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(respBytes))
	}

	return &codeResp, nil
}

func main() {
	client := NewClient("http://localhost:8080", "")
	fmt.Println("OmniCode Go Client ready. BaseURL:", client.BaseURL)
}
