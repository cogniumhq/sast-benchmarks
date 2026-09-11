use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn create_directory(req: HttpRequest) -> HttpResponse {
    let dir_path = req.query_string();
    fs::create_dir_all(dir_path).unwrap();
    HttpResponse::Ok().body("Directory created")
}
