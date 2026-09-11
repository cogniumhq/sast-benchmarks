use actix_web::{web, HttpRequest, HttpResponse};

async fn safe_redirect(req: HttpRequest) -> HttpResponse {
    let page = req.query_string();
    // Only allow paths starting with /
    if !page.starts_with('/') || page.contains("://") {
        return HttpResponse::BadRequest().body("Invalid redirect");
    }
    HttpResponse::Found()
        .insert_header(("Location", page))
        .finish()
}
