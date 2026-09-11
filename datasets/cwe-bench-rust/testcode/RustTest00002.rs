/**
 * CWE-22: Path Traversal - Safe (file_name() sanitization)
 * Source: Actix-web query parameter
 * Sanitizer: Path::file_name() strips directory components
 * Expected: SAFE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;
use std::path::Path;

async fn read_file_safe(req: HttpRequest) -> HttpResponse {
    let user_path = req.query_string();
    // Sanitize: extract only the filename, stripping any directory components
    let safe_name = Path::new(user_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("default.txt");
    let full_path = format!("/var/data/{}", safe_name);
    let content = fs::read_to_string(&full_path).unwrap();
    HttpResponse::Ok().body(content)
}
