package main

import "net/http"

func handler(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("url")
	resp, _ := http.Get(target)
	defer resp.Body.Close()
}
