/**
 * CWE-918: SSRF - Safe (internal URL only)
 * Source: User input (but not used for host)
 * Sanitizer: Fixed internal host, only path from user
 * Expected: SAFE
 */
use actix_web::{web, HttpRequest, HttpResponse};

const INTERNAL_API_BASE: &str = "http://internal-api.local:8080";

async fn internal_fetch(req: HttpRequest) -> HttpResponse {
    let resource_id = req.query_string();

    // Only use user input as a path segment, host is fixed
    let url = format!("{}/resources/{}", INTERNAL_API_BASE, resource_id);

    let response = reqwest::get(&url).await.unwrap();
    let body = response.text().await.unwrap();
    HttpResponse::Ok().body(body)
}
