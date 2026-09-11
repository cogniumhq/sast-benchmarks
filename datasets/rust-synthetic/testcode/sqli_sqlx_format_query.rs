use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::{Pool, Postgres};

async fn get_user(req: HttpRequest, pool: web::Data<Pool<Postgres>>) -> HttpResponse {
    let user_id = req.query_string();
    let query = format!("SELECT * FROM users WHERE id = {}", user_id);
    let result = sqlx::query(&query)
        .fetch_one(pool.get_ref())
        .await;
    HttpResponse::Ok().json(result.ok())
}
