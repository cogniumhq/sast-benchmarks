/**
 * CWE-89: SQL Injection - Safe (sqlx query_as! macro with bind)
 * Source: Actix-web query string
 * Sanitizer: Parameterized query using sqlx::query_as!
 * Expected: SAFE
 */
use sqlx::{Pool, Postgres, FromRow};

#[derive(FromRow)]
struct User {
    id: i32,
    name: String,
}

async fn get_user_safe(pool: &Pool<Postgres>, user_id: i32) -> Option<User> {
    sqlx::query_as!(User, "SELECT id, name FROM users WHERE id = $1", user_id)
        .fetch_one(pool)
        .await
        .ok()
}
