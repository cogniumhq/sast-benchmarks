use diesel::prelude::*;
use diesel::sql_query;

fn search_users(conn: &mut PgConnection, name: &str) -> Vec<User> {
    let query = format!("SELECT * FROM users WHERE name LIKE '%{}%'", name);
    sql_query(query)
        .load::<User>(conn)
        .unwrap()
}
