#!/bin/bash
read -r FILTER
sqlite3 /var/db/app.db "SELECT id, name FROM items WHERE category = '$FILTER'"
