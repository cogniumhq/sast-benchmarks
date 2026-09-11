/**
 * CWE-22: Path Traversal - Vulnerable (direct user input to file read)
 * Source: Actix-web query parameter
 * Sink: std::fs::read_to_string
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn read_file(req: HttpRequest) -> HttpResponse {
    let filename = req.query_string();
    let content = fs::read_to_string(filename).unwrap();
    HttpResponse::Ok().body(content)
}
