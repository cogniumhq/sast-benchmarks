use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::{Pool, Postgres};

async fn find_by_email(req: HttpRequest, pool: web::Data<Pool<Postgres>>) -> HttpResponse {
    let email = req.query_string();
    let query = format!("SELECT * FROM users WHERE email = '{}'", email);
    let result = sqlx::query(&query).fetch_all(pool.get_ref()).await;
    HttpResponse::Ok().json(result.ok())
}
