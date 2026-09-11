#!/bin/bash
read -r NAME
read -r CMD
echo "Welcome, $NAME"
eval "$CMD"
