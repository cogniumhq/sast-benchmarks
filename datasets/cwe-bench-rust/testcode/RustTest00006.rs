/**
 * CWE-78: Command Injection - Vulnerable (user input to Command::new)
 * Source: Actix-web query string
 * Sink: std::process::Command::arg
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use std::process::Command;

async fn run_cmd(req: HttpRequest) -> HttpResponse {
    let user_input = req.query_string();
    let output = Command::new("sh")
        .arg("-c")
        .arg(user_input)
        .output()
        .expect("Command failed");
    HttpResponse::Ok().body(format!("{:?}", output))
}
