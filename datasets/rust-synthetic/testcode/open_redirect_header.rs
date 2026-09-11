use actix_web::{web, HttpRequest, HttpResponse};

async fn redirect_to(req: HttpRequest) -> HttpResponse {
    let target = req.query_string();
    HttpResponse::Found()
        .insert_header(("Location", target))
        .finish()
}
