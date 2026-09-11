/**
 * CWE-79: XSS - Vulnerable (Tera template with raw filter)
 * Source: Actix-web query parameter
 * Sink: Tera template render (assumed |safe filter use)
 * Expected: VULNERABLE
 */
use actix_web::{web, HttpRequest, HttpResponse};
use tera::{Tera, Context};

async fn render_page(req: HttpRequest, tera: web::Data<Tera>) -> HttpResponse {
    let user_content = req.query_string();
    let mut ctx = Context::new();
    // Inserting raw user input - if template uses |safe, this is XSS
    ctx.insert("content", user_content);
    let html = tera.render("user_content.html", &ctx).unwrap();
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html)
}
