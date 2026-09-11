use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct UserData {
    name: String,
    admin: bool,
}

async fn parse_user(body: String) -> HttpResponse {
    let user: UserData = serde_json::from_str(&body).unwrap();
    HttpResponse::Ok().json(user)
}
