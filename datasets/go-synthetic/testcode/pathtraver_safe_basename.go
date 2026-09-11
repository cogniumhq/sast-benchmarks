package main

import (
	"net/http"
	"os"
	"path/filepath"
)

func handler(w http.ResponseWriter, r *http.Request) {
	name := filepath.Base(r.URL.Query().Get("name"))
	p := filepath.Join("/var/uploads", name)
	f, _ := os.Open(p)
	defer f.Close()
}
