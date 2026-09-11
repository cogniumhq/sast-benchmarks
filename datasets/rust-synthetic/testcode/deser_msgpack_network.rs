use std::net::TcpStream;
use std::io::Read;
use serde::Deserialize;

#[derive(Deserialize)]
struct Packet {
    action: String,
    data: Vec<u8>,
}

fn receive_packet(mut stream: TcpStream) -> Packet {
    let mut buffer = Vec::new();
    stream.read_to_end(&mut buffer).unwrap();
    rmp_serde::from_slice(&buffer).unwrap()
}
