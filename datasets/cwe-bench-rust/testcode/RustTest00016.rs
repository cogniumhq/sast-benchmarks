/**
 * CWE-502: Unsafe Deserialization - Vulnerable (serde_json from request body)
 * Source: Actix-web request body
 * Sink: serde_json::from_str
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct UserData {
    name: String,
    role: String,
    is_admin: bool,
}

async fn parse_user_json(body: String) -> HttpResponse {
    let user: UserData = serde_json::from_str(&body).unwrap();
    HttpResponse::Ok().json(user)
}
