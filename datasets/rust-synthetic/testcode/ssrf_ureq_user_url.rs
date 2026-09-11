use actix_web::{web, HttpRequest, HttpResponse};

async fn fetch_with_ureq(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let response = ureq::get(url).call().unwrap();
    let body = response.into_string().unwrap();
    HttpResponse::Ok().body(body)
}
