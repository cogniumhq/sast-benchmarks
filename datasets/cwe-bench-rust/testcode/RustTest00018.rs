/**
 * CWE-502: Unsafe Deserialization - Vulnerable (bincode from network)
 * Source: TcpStream network data
 * Sink: bincode::deserialize
 * Expected: VULNERABLE
 */
use std::net::TcpStream;
use std::io::Read;
use serde::Deserialize;

#[derive(Deserialize)]
struct Command {
    action: String,
    target: String,
    args: Vec<String>,
}

fn receive_command(mut stream: TcpStream) -> Command {
    let mut buffer = Vec::new();
    stream.read_to_end(&mut buffer).unwrap();
    bincode::deserialize(&buffer).unwrap()
}
