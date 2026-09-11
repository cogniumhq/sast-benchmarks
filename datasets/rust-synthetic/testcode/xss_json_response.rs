use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::json;

async fn api_response(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    HttpResponse::Ok().json(json!({
        "message": format!("Hello, {}", name)
    }))
}
