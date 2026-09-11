/**
 * CWE-918: SSRF - Safe (URL allowlist validation)
 * Source: User input
 * Sanitizer: Host allowlist check
 * Expected: SAFE
 */
use url::Url;

const ALLOWED_HOSTS: &[&str] = &["api.example.com", "cdn.example.com"];

async fn fetch_url_safe(user_url: &str) -> Result<String, String> {
    let parsed = Url::parse(user_url).map_err(|e| e.to_string())?;

    let host = parsed.host_str().ok_or("No host in URL")?;

    // Validate against allowlist
    if !ALLOWED_HOSTS.contains(&host) {
        return Err("Host not in allowlist".to_string());
    }

    let response = reqwest::get(user_url)
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}
