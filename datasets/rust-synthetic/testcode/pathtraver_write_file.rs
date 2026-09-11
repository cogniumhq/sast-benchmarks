use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn write_file(req: HttpRequest, body: String) -> HttpResponse {
    let path = req.query_string();
    fs::write(path, body).unwrap();
    HttpResponse::Ok().body("Written")
}
