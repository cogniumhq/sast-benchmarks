#!/bin/bash
CONFIG=$(curl -s "https://config.internal/init.sh")
eval "$CONFIG"
