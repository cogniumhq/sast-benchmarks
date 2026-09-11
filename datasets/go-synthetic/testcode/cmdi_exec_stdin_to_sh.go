package main

import (
	"bufio"
	"os"
	"os/exec"
)

func main() {
	sc := bufio.NewScanner(os.Stdin)
	sc.Scan()
	line := sc.Text()
	_, _ = exec.Command("sh", "-c", line).Output()
}
