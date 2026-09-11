/**
 * CWE-79: XSS - Vulnerable (user input in HTML response)
 * Source: Actix-web query string
 * Sink: HttpResponse with text/html content type
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};

async fn greet_user(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    let html = format!("<html><body><h1>Hello, {}!</h1></body></html>", name);
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html)
}
