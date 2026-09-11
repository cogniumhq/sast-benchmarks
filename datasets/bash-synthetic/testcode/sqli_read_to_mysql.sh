#!/bin/bash
read -r USERNAME
mysql -u root mydb -e "SELECT * FROM users WHERE name = '$USERNAME'"
