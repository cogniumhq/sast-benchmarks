use actix_web::{web, HttpRequest, HttpResponse};
use std::fs;

async fn include_template(req: HttpRequest) -> HttpResponse {
    let template = req.query_string();
    let path = format!("templates/{}", template);
    let contents = fs::read_to_string(path).unwrap();
    HttpResponse::Ok().content_type("text/html").body(contents)
}
