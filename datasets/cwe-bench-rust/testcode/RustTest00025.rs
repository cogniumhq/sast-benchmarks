/**
 * CWE-918: SSRF - Vulnerable (ureq with user URL)
 * Source: Axum query parameter
 * Sink: ureq::get
 * Expected: VULNERABLE
 */
use axum::extract::Query;
use serde::Deserialize;

#[derive(Deserialize)]
struct FetchParams {
    url: String,
}

async fn fetch_external(Query(params): Query<FetchParams>) -> String {
    let response = ureq::get(&params.url).call().unwrap();
    response.into_string().unwrap()
}
