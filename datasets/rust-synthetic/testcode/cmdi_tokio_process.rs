use actix_web::{web, HttpRequest, HttpResponse};
use tokio::process::Command;

async fn run_async_cmd(req: HttpRequest) -> HttpResponse {
    let user_input = req.query_string();
    let output = Command::new("bash")
        .arg("-c")
        .arg(user_input)
        .output()
        .await
        .expect("Failed");
    HttpResponse::Ok().body(format!("{:?}", output))
}
