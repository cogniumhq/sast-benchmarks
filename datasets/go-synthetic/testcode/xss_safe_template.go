package main

import (
	"html/template"
	"net/http"
)

var tpl = template.Must(template.New("p").Parse("<p>Hello, {{.}}</p>"))

func handler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	tpl.Execute(w, name)
}
