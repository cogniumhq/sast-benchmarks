package main

import (
	"database/sql"
	"fmt"
	"net/http"
)

var db *sql.DB

func handler(w http.ResponseWriter, r *http.Request) {
	name := r.FormValue("name")
	q := fmt.Sprintf("SELECT * FROM users WHERE name = '%s'", name)
	_, _ = db.Query(q)
}
