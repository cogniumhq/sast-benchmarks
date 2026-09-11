/**
 * CWE-918: SSRF - Vulnerable (user URL to reqwest)
 * Source: Actix-web query string
 * Sink: reqwest::get
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};

async fn fetch_url(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let response = reqwest::get(url).await.unwrap();
    let body = response.text().await.unwrap();
    HttpResponse::Ok().body(body)
}
