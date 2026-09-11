use actix_web::{web, HttpRequest, HttpResponse};

async fn greet(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    let html = format!("<h1>Hello, {}!</h1>", name);
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html)
}
