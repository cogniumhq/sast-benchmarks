package main

import "net/http"

func handler(w http.ResponseWriter, r *http.Request) {
	target := r.Header.Get("X-Forward-URL")
	resp, _ := http.Get(target)
	defer resp.Body.Close()
}
