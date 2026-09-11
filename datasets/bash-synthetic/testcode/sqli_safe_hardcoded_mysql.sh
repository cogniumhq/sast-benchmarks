#!/bin/bash
mysql -u root mydb -e "SELECT COUNT(*) FROM users WHERE active = 1"
