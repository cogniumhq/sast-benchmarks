package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
)

var db *sql.DB

func handler(c *gin.Context) {
	id := c.Param("id")
	_, _ = db.Query(fmt.Sprintf("SELECT * FROM users WHERE id = %s", id))
}
