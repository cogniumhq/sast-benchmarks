use actix_web::{web, HttpRequest, HttpResponse};
use tokio_postgres::Client;

async fn query_postgres(req: HttpRequest, client: web::Data<Client>) -> HttpResponse {
    let table = req.query_string();
    let query = format!("SELECT * FROM {}", table);
    let rows = client.query(&query, &[]).await.unwrap();
    HttpResponse::Ok().json(rows.len())
}
