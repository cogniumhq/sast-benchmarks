use actix_web::{web, HttpRequest, HttpResponse};
use reqwest;

async fn fetch_url(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let response = reqwest::get(url).await.unwrap();
    let body = response.text().await.unwrap();
    HttpResponse::Ok().body(body)
}
