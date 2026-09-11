use sqlx::{Pool, Postgres};

async fn get_user_safe(pool: &Pool<Postgres>, user_id: i32) -> Option<User> {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", user_id)
        .fetch_one(pool)
        .await
        .ok()
}
