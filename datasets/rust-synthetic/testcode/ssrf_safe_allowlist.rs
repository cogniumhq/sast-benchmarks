use reqwest;

const ALLOWED_HOSTS: &[&str] = &["api.example.com", "cdn.example.com"];

async fn fetch_safe(url: &str) -> Result<String, String> {
    let parsed = url::Url::parse(url).map_err(|e| e.to_string())?;
    let host = parsed.host_str().ok_or("No host")?;

    if !ALLOWED_HOSTS.contains(&host) {
        return Err("Host not allowed".to_string());
    }

    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    response.text().await.map_err(|e| e.to_string())
}
