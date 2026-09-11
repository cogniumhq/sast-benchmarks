use actix_web::{web, HttpRequest, HttpResponse};

async fn fetch_with_redirect(req: HttpRequest) -> HttpResponse {
    let url = req.query_string();
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .unwrap();
    let response = client.get(url).send().await.unwrap();
    HttpResponse::Ok().body(response.text().await.unwrap())
}
