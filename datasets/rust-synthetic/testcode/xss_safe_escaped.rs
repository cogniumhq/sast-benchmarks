use actix_web::{web, HttpRequest, HttpResponse};
use html_escape::encode_text;

async fn greet_safe(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    let escaped = encode_text(name);
    let html = format!("<h1>Hello, {}!</h1>", escaped);
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html)
}
