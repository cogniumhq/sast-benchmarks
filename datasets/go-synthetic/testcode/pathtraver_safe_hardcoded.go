package main

import "os"

func boot() {
	f, _ := os.Open("/etc/app/config.json")
	defer f.Close()
}
