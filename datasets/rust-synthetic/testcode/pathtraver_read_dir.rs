use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn list_dir(req: HttpRequest) -> HttpResponse {
    let dir_path = req.query_string();
    let entries: Vec<String> = fs::read_dir(dir_path)
        .unwrap()
        .map(|e| e.unwrap().path().display().to_string())
        .collect();
    HttpResponse::Ok().json(entries)
}
