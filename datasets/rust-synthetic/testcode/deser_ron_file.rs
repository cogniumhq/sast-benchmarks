use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct GameState {
    level: u32,
    score: i64,
}

async fn load_game(body: String) -> HttpResponse {
    let state: GameState = ron::from_str(&body).unwrap();
    HttpResponse::Ok().json(state)
}
