#!/bin/bash
read -r QUERY
psql -U admin mydb -c "$QUERY"
