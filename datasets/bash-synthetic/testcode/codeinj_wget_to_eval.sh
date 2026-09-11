#!/bin/bash
INSTALLER=$(wget -qO- "https://get.example.com/install.sh")
eval "$INSTALLER"
