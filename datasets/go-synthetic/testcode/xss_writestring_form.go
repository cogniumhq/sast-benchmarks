package main

import (
	"io"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	msg := r.FormValue("msg")
	io.WriteString(w, "<div class=msg>"+msg+"</div>")
}
