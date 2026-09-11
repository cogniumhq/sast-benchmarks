#!/bin/bash
curl -s "https://api.example.com/health"
curl -X POST "https://api.example.com/status" -d '{"status":"ok"}'
