/**
 * CWE-79: XSS - Vulnerable (href attribute injection)
 * Source: Rocket path parameter
 * Sink: HTML href attribute
 * Expected: VULNERABLE
 */
use rocket::get;

#[get("/link/<url>")]
fn create_link(url: String) -> rocket::response::content::RawHtml<String> {
    let html = format!(
        "<html><body><a href='{}'>Click here</a></body></html>",
        url
    );
    rocket::response::content::RawHtml(html)
}
