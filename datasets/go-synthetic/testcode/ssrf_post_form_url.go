package main

import (
	"net/http"
	"strings"
)

func handler(w http.ResponseWriter, r *http.Request) {
	target := r.PostFormValue("callback")
	http.Post(target, "application/json", strings.NewReader("{}"))
}
