package main

import "net/http"

func ping() {
	resp, _ := http.Get("https://api.example.com/health")
	defer resp.Body.Close()
}
