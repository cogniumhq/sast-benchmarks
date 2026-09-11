use actix_web::{web, HttpRequest, HttpResponse};

async fn login_redirect(req: HttpRequest) -> HttpResponse {
    let return_url = req.query_string();
    HttpResponse::SeeOther()
        .insert_header(("Location", return_url))
        .finish()
}
