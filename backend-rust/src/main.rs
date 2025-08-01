use std::net::SocketAddr;
use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    Router,
};
use axum::extract::ws::Message;
use axum::response::Response;
use tokio::net::{TcpListener};

// TODO: Implement YDoc/Yrs sync and filesystem creation
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/manuscript", get(handle_ws))
        .route("/healthcheck", get(health_check));
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 9001));

    let listener = TcpListener::bind(addr)
        .await
        .unwrap();

    println!("WS listening on ws://{}{}", addr, "/manuscript");

    if let Err(e) = axum::serve(listener, app).await {
        println!("Server error: {e}");
    }
}

async fn health_check() -> &'static str {
    "healthy :D"
}

async fn handle_ws(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_manuscript_socket)
}

async fn handle_manuscript_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        if let Ok(msg) = msg {
            match msg {
                Message::Text(t) => {
                    println!("client sent str: {:?}", t);
                    if socket.send(Message::Text(format!("You sent: {}", t).into())).await.is_err() {
                        println!("client disconnected");
                        return;
                    }
                }
                Message::Binary(b) => {
                    println!("client sent binary: {:?}", b);
                    if socket.send(Message::Binary(b)).await.is_err() {
                        println!("client disconnected");
                        return;
                    }
                }
                Message::Ping(p) => {
                    println!("client sent ping: {:?}", p);
                }
                Message::Pong(p) => {
                    println!("client sent pong: {:?}", p);
                }
                Message::Close(c) => {
                    println!("client sent close: {:?}", c);
                    return;
                }
            }
        } else {
            println!("client disconnected");
            return;
        }
    }

}