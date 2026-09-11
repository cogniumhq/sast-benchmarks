/**
 * CWE-22: Path Traversal - Vulnerable (fs::write with user path)
 * Source: Actix-web request body
 * Sink: std::fs::write
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn write_file(req: HttpRequest, body: String) -> HttpResponse {
    let filepath = req.query_string();
    fs::write(filepath, &body).unwrap();
    HttpResponse::Ok().body("File written")
}
