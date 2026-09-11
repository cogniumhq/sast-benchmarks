package main

import "database/sql"

var db *sql.DB

func cleanup() {
	_, _ = db.Exec("DELETE FROM sessions WHERE expires_at < NOW()")
}
