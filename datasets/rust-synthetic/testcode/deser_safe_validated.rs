use serde::Deserialize;

#[derive(Deserialize)]
struct SafeData {
    id: u32,
}

fn parse_with_limit(data: &[u8]) -> Result<SafeData, String> {
    if data.len() > 1024 {
        return Err("Data too large".to_string());
    }
    serde_json::from_slice(data).map_err(|e| e.to_string())
}
