pub mod users;
pub mod pickers;
pub mod orders;

pub use users::*;
pub use pickers::*;
pub use orders::*;

use axum::{
    middleware,
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;

use crate::config::AppState;
use crate::download::download;
use crate::openapi::create_swagger_routes;
use crate::middleware::auth_middleware;


/// 健康检查处理函数
#[utoipa::path(
    get,
    path = "/",
    tag = "health",
    summary = "Health Check",
    description = "Check if the server is running",
    responses(
        (status = 200, description = "Server is running", body = String, example = "Pickers Server is running!")
    )
)]
pub async fn health_check() -> &'static str {
    "Pickers Server is running!"
}

/// 创建公开路由
pub fn create_routes() -> Router<AppState> {
    Router::new()
        // 健康检查
        .route("/", get(health_check))
        // 用户相关路由（公开）
        .route("/api/users/system_info", get(get_system_info))
        .route("/api/users/register", post(register))
        .route("/api/users/verify", post(verify))
        .route("/api/users/login", post(login))
        // Picker相关路由（公开）
        .route("/api/pickers", get(get_market))
        .route("/api/pickers/{picker_id}", get(get_picker_detail))
        // 下载路由
        .route("/download", get(download))
        // Swagger UI 路由
        .merge(create_swagger_routes())
        // 添加CORS支持
        .layer(CorsLayer::permissive())
}

/// 创建需要认证的路由
pub fn create_protected_routes(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/api/users/profile", get(get_profile))
        .route("/api/pickers", post(upload_picker))
        .route("/api/orders", post(create_order))
        .route("/api/orders/{order_id}", get(get_order_detail))
        .route("/api/orders", get(get_user_orders))
        // 应用认证中间件到所有受保护的路由
        .layer(middleware::from_fn_with_state(state, auth_middleware))
}

