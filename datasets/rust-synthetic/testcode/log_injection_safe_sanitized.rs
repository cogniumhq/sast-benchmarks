use log::info;

fn log_safe(message: &str) {
    let sanitized = message.replace('
', " ").replace('', " ");
    info!("Message: {}", sanitized);
}
