#!/bin/bash
REDIRECT=$(curl -s "https://tracker.internal/next-step")
curl "$REDIRECT"
