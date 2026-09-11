#!/bin/bash
RECORD_ID=$(curl -s "https://api.internal/current-id")
mysql -u root appdb -e "DELETE FROM sessions WHERE id = $RECORD_ID"
