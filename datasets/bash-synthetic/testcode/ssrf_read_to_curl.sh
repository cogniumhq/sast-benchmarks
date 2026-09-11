#!/bin/bash
echo "Enter endpoint URL:"
read -r ENDPOINT
curl "$ENDPOINT"
