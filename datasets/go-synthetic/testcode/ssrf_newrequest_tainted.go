package main

import "net/http"

func handler(w http.ResponseWriter, r *http.Request) {
	target := r.FormValue("target")
	req, _ := http.NewRequest("GET", target, nil)
	http.DefaultClient.Do(req)
}
