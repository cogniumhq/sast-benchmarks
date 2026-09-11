package main

import "os/exec"

func warm() {
	_, _ = exec.Command("uname", "-a").Output()
}
