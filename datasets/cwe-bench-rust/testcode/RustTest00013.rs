/**
 * CWE-89: SQL Injection - Vulnerable (diesel sql_query with format!)
 * Source: function parameter
 * Sink: diesel::sql_query
 * Expected: VULNERABLE
 */
use diesel::prelude::*;
use diesel::sql_query;

#[derive(QueryableByName)]
struct User {
    #[diesel(sql_type = diesel::sql_types::Integer)]
    id: i32,
    #[diesel(sql_type = diesel::sql_types::Text)]
    name: String,
}

fn search_users(conn: &mut PgConnection, search_name: &str) -> Vec<User> {
    let query = format!(
        "SELECT id, name FROM users WHERE name LIKE '%{}%'",
        search_name
    );
    sql_query(query)
        .load::<User>(conn)
        .unwrap()
}
