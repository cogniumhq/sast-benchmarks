use std::process::Command;

const ALLOWED_CMDS: &[&str] = &["ls", "pwd", "whoami"];

fn run_validated(cmd: &str) -> Result<String, String> {
    if !ALLOWED_CMDS.contains(&cmd) {
        return Err("Command not allowed".to_string());
    }
    let output = Command::new(cmd)
        .output()
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
