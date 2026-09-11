/**
 * CWE-502: Unsafe Deserialization - Vulnerable (serde_yaml from request)
 * Source: Actix-web request body
 * Sink: serde_yaml::from_str
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct Config {
    database_url: String,
    secret_key: String,
    debug: bool,
}

async fn parse_config_yaml(body: String) -> HttpResponse {
    let config: Config = serde_yaml::from_str(&body).unwrap();
    HttpResponse::Ok().json(config)
}
