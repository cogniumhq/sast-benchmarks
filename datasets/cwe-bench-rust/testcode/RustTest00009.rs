/**
 * CWE-78: Command Injection - Safe (allowlist validation)
 * Source: User input parameter
 * Sanitizer: Allowlist check before execution
 * Expected: SAFE
 */
use std::process::Command;

const ALLOWED_COMMANDS: &[&str] = &["ls", "pwd", "whoami", "date"];

fn run_safe_command(cmd: &str) -> Result<String, String> {
    // Validate against allowlist
    if !ALLOWED_COMMANDS.contains(&cmd) {
        return Err("Command not in allowlist".to_string());
    }

    let output = Command::new(cmd)
        .output()
        .map_err(|e| e.to_string())?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
