use std::fs;
use std::path::Path;

fn read_safe(user_path: &str) -> Result<String, String> {
    let base = Path::new("/var/data").canonicalize().map_err(|e| e.to_string())?;
    let full_path = base.join(user_path).canonicalize().map_err(|e| e.to_string())?;

    if !full_path.starts_with(&base) {
        return Err("Path traversal detected".to_string());
    }

    fs::read_to_string(full_path).map_err(|e| e.to_string())
}
