package main

import (
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("file")
	f, _ := os.Open(path)
	defer f.Close()
}
