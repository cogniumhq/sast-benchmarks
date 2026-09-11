use actix_web::{web, HttpRequest, HttpResponse};
use log::info;

async fn log_user(req: HttpRequest) -> HttpResponse {
    let username = req.query_string();
    info!("User logged in: {}", username);
    HttpResponse::Ok().body("Logged")
}
