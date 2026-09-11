/**
 * CWE-78: Command Injection - Vulnerable (Rocket param to Command)
 * Source: Rocket path parameter
 * Sink: std::process::Command::new
 * Expected: VULNERABLE
 */
use rocket::get;
use std::process::Command;

#[get("/exec/<cmd>")]
fn execute(cmd: String) -> String {
    let output = Command::new(&cmd)
        .output()
        .expect("Command failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
