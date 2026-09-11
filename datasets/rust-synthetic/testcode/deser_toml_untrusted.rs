use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct Config {
    database_url: String,
    api_key: String,
}

async fn parse_config(body: String) -> HttpResponse {
    let config: Config = toml::from_str(&body).unwrap();
    HttpResponse::Ok().json(config)
}
