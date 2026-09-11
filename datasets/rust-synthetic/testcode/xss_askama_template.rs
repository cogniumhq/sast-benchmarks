use actix_web::{web, HttpRequest, HttpResponse};
use askama::Template;

#[derive(Template)]
#[template(path = "hello.html")]
struct HelloTemplate<'a> {
    name: &'a str,
}

async fn render_askama(req: HttpRequest) -> HttpResponse {
    let name = req.query_string();
    let template = HelloTemplate { name };
    HttpResponse::Ok().content_type("text/html").body(template.render().unwrap())
}
