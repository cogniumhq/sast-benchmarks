#!/bin/bash
read -r API_URL
RESULT=$(curl -s "$API_URL")
echo "$RESULT"
