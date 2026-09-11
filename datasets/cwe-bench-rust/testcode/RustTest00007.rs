/**
 * CWE-78: Command Injection - Safe (hardcoded command)
 * Source: None (hardcoded)
 * Sink: std::process::Command
 * Expected: SAFE
 */
use std::process::Command;

fn list_files() -> String {
    let output = Command::new("ls")
        .arg("-la")
        .arg("/var/data")
        .output()
        .expect("Command failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
