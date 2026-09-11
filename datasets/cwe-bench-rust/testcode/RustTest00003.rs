/**
 * CWE-22: Path Traversal - Vulnerable (Rocket path param to tokio::fs)
 * Source: Rocket path parameter
 * Sink: tokio::fs::read_to_string
 * Expected: VULNERABLE
 */
use rocket::get;
use tokio::fs;

#[get("/files/<filename>")]
async fn get_file(filename: String) -> String {
    let path = format!("/uploads/{}", filename);
    fs::read_to_string(&path).await.unwrap()
}
