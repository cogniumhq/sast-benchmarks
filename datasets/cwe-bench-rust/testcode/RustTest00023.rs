/**
 * CWE-918: SSRF - Vulnerable (Rocket param to hyper client)
 * Source: Rocket path parameter
 * Sink: hyper::Client::get
 * Expected: VULNERABLE
 */
use rocket::get;
use hyper::{Client, Uri};

#[get("/proxy/<url>")]
async fn proxy_request(url: String) -> String {
    let uri: Uri = url.parse().unwrap();
    let client = Client::new();
    let response = client.get(uri).await.unwrap();
    format!("Status: {}", response.status())
}
