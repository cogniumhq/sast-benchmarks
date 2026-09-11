use std::io::{self, BufRead};
use std::process::Command;

fn run_from_stdin() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let cmd = line.unwrap();
        Command::new("sh")
            .arg("-c")
            .arg(&cmd)
            .spawn()
            .expect("Failed");
    }
}
