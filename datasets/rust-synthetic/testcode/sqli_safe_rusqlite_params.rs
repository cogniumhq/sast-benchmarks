use rusqlite::{Connection, params};

fn get_user_safe(conn: &Connection, user_id: i32) -> Option<String> {
    let mut stmt = conn.prepare("SELECT name FROM users WHERE id = ?1").unwrap();
    stmt.query_row(params![user_id], |row| row.get(0)).ok()
}
