/**
 * CWE-79: XSS - Safe (JSON response, not HTML)
 * Source: Actix-web query string
 * Sanitizer: JSON response type (not rendered as HTML)
 * Expected: SAFE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::json;

async fn api_response(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    HttpResponse::Ok().json(json!({
        "message": format!("Hello, {}", name),
        "status": "success"
    }))
}
