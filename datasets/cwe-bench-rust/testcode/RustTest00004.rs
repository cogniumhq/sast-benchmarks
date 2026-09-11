/**
 * CWE-22: Path Traversal - Safe (canonicalize + prefix check)
 * Source: Axum path parameter
 * Sanitizer: canonicalize() with starts_with() prefix validation
 * Expected: SAFE
 */
use axum::extract::Path;
use std::fs;
use std::path::PathBuf;

async fn read_file_secure(Path(filename): Path<String>) -> Result<String, String> {
    let base_dir = PathBuf::from("/var/data").canonicalize()
        .map_err(|e| e.to_string())?;
    let requested = base_dir.join(&filename).canonicalize()
        .map_err(|e| e.to_string())?;

    // Validate the path is within the allowed directory
    if !requested.starts_with(&base_dir) {
        return Err("Path traversal attempt detected".to_string());
    }

    fs::read_to_string(&requested).map_err(|e| e.to_string())
}
