use actix_web::{web, HttpRequest, HttpResponse};
use tokio::fs;

async fn read_async_file(req: HttpRequest) -> HttpResponse {
    let path = req.query_string();
    let contents = fs::read_to_string(path).await.unwrap();
    HttpResponse::Ok().body(contents)
}
