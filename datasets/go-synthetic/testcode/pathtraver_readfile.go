package main

import (
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	path := r.FormValue("path")
	data, _ := os.ReadFile(path)
	w.Write(data)
}
