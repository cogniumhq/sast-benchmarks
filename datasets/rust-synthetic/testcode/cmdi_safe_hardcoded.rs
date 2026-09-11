use std::process::Command;

fn list_files() -> String {
    let output = Command::new("ls")
        .arg("-la")
        .output()
        .expect("Failed");
    String::from_utf8_lossy(&output.stdout).to_string()
}
