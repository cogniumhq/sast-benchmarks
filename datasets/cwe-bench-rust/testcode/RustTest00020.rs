/**
 * CWE-502: Unsafe Deserialization - Safe (typed extraction with validation)
 * Source: Axum typed extraction
 * Sanitizer: Axum's typed extraction with compile-time type safety
 * Expected: SAFE
 */
use axum::extract::Json;
use serde::Deserialize;
use axum::http::StatusCode;

#[derive(Deserialize)]
struct CreateUser {
    username: String,
    email: String,
}

async fn create_user(
    Json(payload): Json<CreateUser>
) -> Result<String, StatusCode> {
    // Axum's typed extraction validates structure at parse time
    // Only known fields are accepted
    if payload.username.len() > 50 || payload.email.len() > 100 {
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok(format!("Created user: {}", payload.username))
}
