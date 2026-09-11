use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct Settings {
    host: String,
    port: u16,
}

async fn parse_yaml(body: String) -> HttpResponse {
    let settings: Settings = serde_yaml::from_str(&body).unwrap();
    HttpResponse::Ok().json(settings)
}
