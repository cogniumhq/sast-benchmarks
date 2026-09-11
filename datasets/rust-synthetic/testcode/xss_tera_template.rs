use actix_web::{web, HttpRequest, HttpResponse};
use tera::{Tera, Context};

async fn render_page(req: HttpRequest, tera: web::Data<Tera>) -> HttpResponse {
    let name = req.query_string();
    let mut ctx = Context::new();
    ctx.insert("name", name);
    // Using |safe filter bypasses escaping
    let html = tera.render("page.html", &ctx).unwrap();
    HttpResponse::Ok().content_type("text/html").body(html)
}
