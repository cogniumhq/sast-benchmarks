/**
 * CWE-502: Unsafe Deserialization - Safe (with size limit validation)
 * Source: Network data
 * Sanitizer: Size limit check before deserialization
 * Expected: SAFE
 */
use serde::Deserialize;

const MAX_PAYLOAD_SIZE: usize = 4096;

#[derive(Deserialize)]
struct Message {
    action: String,
    payload: Vec<u8>,
}

fn parse_with_limit(data: &[u8]) -> Result<Message, String> {
    // Validate size before deserializing
    if data.len() > MAX_PAYLOAD_SIZE {
        return Err("Payload too large".to_string());
    }

    serde_json::from_slice(data).map_err(|e| e.to_string())
}
