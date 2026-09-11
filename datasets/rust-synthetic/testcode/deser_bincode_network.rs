use std::net::TcpStream;
use std::io::Read;
use serde::Deserialize;

#[derive(Deserialize)]
struct Message {
    cmd: String,
    args: Vec<String>,
}

fn receive_message(mut stream: TcpStream) -> Message {
    let mut buffer = Vec::new();
    stream.read_to_end(&mut buffer).unwrap();
    bincode::deserialize(&buffer).unwrap()
}
