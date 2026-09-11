use actix_web::{web, HttpRequest, HttpResponse};

async fn render_link(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let html = format!("<a href='{}'>Click here</a>", url);
    HttpResponse::Ok().content_type("text/html").body(html)
}
