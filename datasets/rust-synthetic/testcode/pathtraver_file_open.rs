use actix_web::{web, HttpRequest, HttpResponse};
use std::fs::File;
use std::io::Read;

async fn read_file(req: HttpRequest) -> HttpResponse {
    let filename = req.query_string();
    let mut file = File::open(filename).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    HttpResponse::Ok().body(contents)
}
