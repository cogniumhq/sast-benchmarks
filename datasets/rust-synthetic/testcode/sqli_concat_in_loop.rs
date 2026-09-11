use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::{Pool, Postgres};

async fn search_multiple(req: HttpRequest, pool: web::Data<Pool<Postgres>>) -> HttpResponse {
    let terms: Vec<&str> = req.query_string().split(',').collect();
    let mut conditions = Vec::new();
    for term in terms {
        conditions.push(format!("name LIKE '%{}%'", term));
    }
    let query = format!("SELECT * FROM products WHERE {}", conditions.join(" OR "));
    let result = sqlx::query(&query).fetch_all(pool.get_ref()).await;
    HttpResponse::Ok().json(result.ok())
}
