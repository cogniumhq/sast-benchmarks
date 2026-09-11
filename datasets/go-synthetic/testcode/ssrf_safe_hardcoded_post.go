package main

import (
	"net/http"
	"strings"
)

func notify() {
	http.Post("https://hooks.example.com/event", "application/json", strings.NewReader("{\"event\":\"ok\"}"))
}
