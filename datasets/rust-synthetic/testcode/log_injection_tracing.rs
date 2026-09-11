use actix_web::{web, HttpRequest, HttpResponse};
use tracing::info;

async fn trace_request(req: HttpRequest) -> HttpResponse {
    let action = req.query_string();
    info!(action = %action, "User action recorded");
    HttpResponse::Ok().body("OK")
}
