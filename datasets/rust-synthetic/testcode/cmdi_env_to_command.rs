use std::env;
use std::process::Command;

fn run_from_env() -> String {
    let cmd = env::var("USER_CMD").unwrap();
    let output = Command::new("sh")
        .arg("-c")
        .arg(&cmd)
        .output()
        .expect("Failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
