package main

import (
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	target := r.PostFormValue("target")
	f, _ := os.OpenFile(target, os.O_RDWR, 0644)
	defer f.Close()
}
