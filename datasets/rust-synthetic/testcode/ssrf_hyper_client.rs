use actix_web::{web, HttpRequest, HttpResponse};
use hyper::{Client, Uri};

async fn fetch_hyper(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let uri: Uri = url.parse().unwrap();
    let client = Client::new();
    let response = client.get(uri).await.unwrap();
    HttpResponse::Ok().body(format!("Status: {}", response.status()))
}
