use warp::Filter;

async fn greet_warp(name: String) -> impl warp::Reply {
    let html = format!("<html><body><h1>Hello, {}!</h1></body></html>", name);
    warp::reply::html(html)
}

fn routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    warp::path!("greet" / String)
        .and_then(|name| async move { Ok::<_, warp::Rejection>(greet_warp(name).await) })
}
