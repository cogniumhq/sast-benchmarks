use axum::extract::Json;
use std::process::Command;
use serde::Deserialize;

#[derive(Deserialize)]
struct CmdRequest {
    command: String,
}

async fn execute_cmd(Json(payload): Json<CmdRequest>) -> String {
    let output = Command::new("sh")
        .arg("-c")
        .arg(&payload.command)
        .output()
        .expect("Failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
