/**
 * CWE-89: SQL Injection - Vulnerable (rusqlite with string concat)
 * Source: Actix-web query string
 * Sink: rusqlite Connection::execute
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use rusqlite::Connection;

async fn delete_user(
    req: HttpRequest,
    conn: web::Data<Connection>
) -> HttpResponse {
    let user_id = req.query_string();
    let sql = format!("DELETE FROM users WHERE id = '{}'", user_id);
    conn.execute(&sql, []).unwrap();
    HttpResponse::Ok().body("User deleted")
}
