/**
 * CWE-89: SQL Injection - Safe (rusqlite with params! macro)
 * Source: function parameter
 * Sanitizer: Parameterized query using rusqlite params!
 * Expected: SAFE
 */
use rusqlite::{Connection, params};

fn get_user_by_id(conn: &Connection, user_id: i32) -> Option<String> {
    let mut stmt = conn.prepare(
        "SELECT name FROM users WHERE id = ?1"
    ).unwrap();

    stmt.query_row(params![user_id], |row| row.get(0)).ok()
}
