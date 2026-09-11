/**
 * CWE-79: XSS - Safe (HTML escaped output)
 * Source: Actix-web query string
 * Sanitizer: html_escape::encode_text
 * Expected: SAFE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use html_escape::encode_text;

async fn greet_user_safe(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    let escaped_name = encode_text(name);
    let html = format!("<html><body><h1>Hello, {}!</h1></body></html>", escaped_name);
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html)
}
