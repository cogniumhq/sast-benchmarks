use std::fs::File;
use std::path::Path;

fn read_from_data_dir(filename: &str) -> String {
    // Only use the filename, strip any path components
    let base = Path::new(filename)
        .file_name()
        .unwrap()
        .to_str()
        .unwrap();
    let safe_path = format!("./data/{}", base);
    std::fs::read_to_string(safe_path).unwrap()
}
