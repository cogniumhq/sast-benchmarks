#!/bin/bash
read -r REMOTE_URL
wget -O /tmp/output.txt "$REMOTE_URL"
