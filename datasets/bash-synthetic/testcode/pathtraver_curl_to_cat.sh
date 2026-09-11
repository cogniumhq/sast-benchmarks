#!/bin/bash
LOG_PATH=$(curl -s "https://api.internal/logfile")
cat "$LOG_PATH"
