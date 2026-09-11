package main

import (
	"database/sql"
	"net/http"
)

var db *sql.DB

func handler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	_, _ = db.Query("SELECT * FROM users WHERE id = " + id)
}
