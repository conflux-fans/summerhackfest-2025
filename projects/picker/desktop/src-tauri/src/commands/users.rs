// 用户相关命令

use crate::api::client::ApiClient;
use crate::api::models::{ConnectionStatus, SystemInfo, LoginRequest, LoginResponse, ResponseUserInfo, RegisterRequest, RegisterResponse, UserInfo, VerifyRequest, VerifyResponse};
use crate::config::AppConfig;
use crate::utils::auth::AuthManager;
use tauri::State;
use crate::api::models::UserType;
use alloy::providers::{Provider, ProviderBuilder};
use alloy::primitives::{Address, Uint};

// #[tauri::command]
// pub async fn simple_connection_test(name: &str) -> Result<String, String> {
//     Ok(format!("Connection test successful123, name: {}", name))
// }

// 健康检查主要命令函数
#[tauri::command]
pub async fn api_connection() -> Result<ConnectionStatus, String> {
    let start_time = std::time::Instant::now();
    
    // 加载配置
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, None);
    
    // 测试 API 端点连接 - 使用健康检查端点
    match api_client.get::<String>("/", None).await {
        Ok(response) => {
            let response_time = start_time.elapsed().as_millis() as u64;
            
            // 尝试从响应中提取服务器状态信息
            let server_message = if response.is_empty() {
                "Server is running, but not message".to_string()
            } else {
                response
            };
            
            Ok(ConnectionStatus {
                is_connected: true,
                response_time_ms: response_time,
                server_status: server_message, // 使用实际的服务器响应消息
                auth_valid: false, // 健康检查不需要认证
                error_message: None,
            })
        }
        Err(e) => {
            let response_time = start_time.elapsed().as_millis() as u64;
            Ok(ConnectionStatus {
                is_connected: false,
                response_time_ms: response_time,
                server_status: "Connection Failed".to_string(),
                auth_valid: false,
                error_message: Some(e.to_string()),
            })
        }
    }
}

async fn system_info(
    auth_manager: State<'_, AuthManager>,
)-> Result<SystemInfo, String> {
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, Some(auth_manager.inner().clone()));
    
    // 保持与实际实现一致的路径
    let response: SystemInfo = api_client.get("/api/users/system_info", None).await.map_err(|e| e.to_string())?;
    Ok(response)
}

// 获取系统信息
#[tauri::command]
pub async fn get_system_info(
    auth_manager: State<'_, AuthManager>,
) -> Result<SystemInfo, String> {
    let response = system_info(auth_manager).await.map_err(|e| e.to_string())?;
    Ok(response)
}

// 登录命令 单独定义登录返回信息
#[tauri::command]
pub async fn login(
    email: String,
    user_password: String,
    auth_manager: State<'_, AuthManager>,
) -> Result<ResponseUserInfo, String> {
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, None);
    
    let request = LoginRequest {
        email,
        user_password,
    };
    
    let response: LoginResponse = api_client.post("/api/users/login", &request).await.map_err(|e| e.to_string())?;
    
    // 保存 token
    auth_manager.set_token(&response.token).map_err(|e| e.to_string())?;

    let system_info_response = system_info(auth_manager.clone()).await.map_err(|e| e.to_string())?;
    let rpc_url = system_info_response.chain_url;

    // 先解析URL并处理错误
    let parsed_url = rpc_url.parse().map_err(|e| {
        format!("Invalid RPC URL: {}", e)
    })?;

    // 初始化provider
    let provider = ProviderBuilder::new()
        .connect_http(parsed_url);

    // 获取钱包地址
    let address: Address = response.user.wallet_address.parse().map_err(|e| {
        format!("Invalid wallet address: {}", e)
    })?;

    // 获取钱包余额
    let balance = provider.get_balance(address).await.map_err(|e| {
        format!("Failed to get wallet balance: {}", e)
    })?;   

    // 转换为i64 - 使用TryInto特质将Uint<256,4>转换为i64
    // 先除以10^9得到gwei单位，避免可能的溢出
    let wallet_balance = match balance.checked_div(Uint::from(1e9 as u64)) {
        Some(value) => match value.try_into() {
            Ok(num) => num,
            Err(_) => 0, // 处理转换失败的情况
        },
        None => 0, // 处理除以零的情况
    };

    let response_user_info = ResponseUserInfo {
        chain_name: system_info_response.chain_name,
        premium_free: system_info_response.premium_free,
        premium_payment_rate: system_info_response.premium_payment_rate,
        premium_to_usd: system_info_response.premium_to_usd,
        premium_period: system_info_response.premium_period,
        premium_start: system_info_response.premium_start,
        wallet_balance,
        user_info: UserInfo {
            user_id: response.user.user_id.to_string(),
            email: response.user.email.to_string(), 
            user_name: response.user.user_name.to_string(),
            user_type: response.user.user_type,
            wallet_address: response.user.wallet_address.to_string(),
            premium_balance: response.user.premium_balance,
            created_at: response.user.created_at.to_string(),
        },
    };

    // 保存用户信息
    let user_info_json = serde_json::to_value(response_user_info.clone()).map_err(|e| e.to_string())?;
    auth_manager.save_user_info(&user_info_json).map_err(|e| e.to_string())?;
    
    Ok(response_user_info)
}

// 注册命令
#[tauri::command]
pub async fn register(
    email: String,
    user_password: String,
    user_name: String,
    user_type: String,
) -> Result<RegisterResponse, String> {
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, None);
    
    let user_type_enum = if user_type.to_lowercase() == "dev" {
        UserType::Dev
    } else {
        UserType::Gen
    };

    let request = RegisterRequest {
        email,
        user_name,
        user_password,
        user_type: user_type_enum,
        
    };
    let response: RegisterResponse = api_client.post("/api/users/register", &request).await.map_err(|e| e.to_string())?;

    Ok(response)
}

// 邮箱验证命令
#[tauri::command]
pub async fn verify_email(
    email: String,
    code: String,
) -> Result<VerifyResponse, String> {
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, None);
    
    let request = VerifyRequest {
        email,
        code,
    };
    
    let response: VerifyResponse = api_client.post("/api/users/verify", &request).await.map_err(|e| e.to_string())?;
    Ok(response)
}

// 调用API接口获取用户资料命令
#[tauri::command]
pub async fn get_user_profile(
    auth_manager: State<'_, AuthManager>,
) -> Result<UserInfo, String> {
    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());
    let api_client = ApiClient::new(&config, Some(auth_manager.inner().clone()));
    
    // 保持与实际实现一致的路径
    let response: UserInfo = api_client.get("/api/users/profile", None).await.map_err(|e| e.to_string())?;

    // 更新用户信息
    let user_info_json = serde_json::to_value(&response).map_err(|e| e.to_string())?;
    auth_manager.save_user_info(&user_info_json).map_err(|e| e.to_string())?;

    Ok(response)
}

// 登出命令
#[tauri::command]
pub async fn logout(
    auth_manager: State<'_, AuthManager>,
) -> Result<bool, String> {
    auth_manager.clear_token().map_err(|e| e.to_string())?;
    Ok(true)
}

// 检查登录状态命令
#[tauri::command]
pub async fn check_login_status(
    auth_manager: State<'_, AuthManager>,
) -> Result<bool, String> {
    Ok(auth_manager.is_logged_in())
}

// 获取登录保存的当前用户信息命令
#[tauri::command]
pub async fn get_current_user_info(
    auth_manager: State<'_, AuthManager>,
) -> Result<Option<serde_json::Value>, String> {
    Ok(auth_manager.get_user_info())
}