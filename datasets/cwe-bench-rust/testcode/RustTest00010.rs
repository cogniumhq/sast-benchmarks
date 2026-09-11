/**
 * CWE-78: Command Injection - Vulnerable (tokio::process::Command)
 * Source: Axum JSON body
 * Sink: tokio::process::Command::arg
 * Expected: VULNERABLE
 */
use axum::extract::Json;
use serde::Deserialize;
use tokio::process::Command;

#[derive(Deserialize)]
struct CmdRequest {
    command: String,
}

async fn execute_cmd(Json(payload): Json<CmdRequest>) -> String {
    let output = Command::new("bash")
        .arg("-c")
        .arg(&payload.command)
        .output()
        .await
        .expect("Command failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
