package main

import (
	"net/http"
	"os/exec"
)

func handler(w http.ResponseWriter, r *http.Request) {
	host := r.URL.Query().Get("host")
	_, _ = exec.Command("ping", "-c", "1", host).Output()
}
