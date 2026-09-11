package main

import (
	"net/http"
	"os"
	"path/filepath"
)

func handler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	p := filepath.Join("/var/uploads", name)
	data, _ := os.ReadFile(p)
	w.Write(data)
}
