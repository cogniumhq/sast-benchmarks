use actix_web::{web, HttpRequest, HttpResponse};
use rusqlite::Connection;

async fn search_rusqlite(req: HttpRequest, conn: web::Data<Connection>) -> HttpResponse {
    let search = req.query_string();
    let query = format!("SELECT * FROM items WHERE name = '{}'", search);
    let mut stmt = conn.prepare(&query).unwrap();
    let results: Vec<String> = stmt.query_map([], |row| row.get(0))
        .unwrap()
        .map(|r| r.unwrap())
        .collect();
    HttpResponse::Ok().json(results)
}
