use axum::{
    extract::State,
    response::Json,
    Extension,
};
use chrono::{DateTime, Utc, Duration};
use jsonwebtoken::{encode, Header, EncodingKey};
use rand::Rng;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use tracing::info;
use uuid::Uuid;

use crate::config::{AppState, Claims, PendingRegistration};
use crate::models::{User, UserType, VerificationCode};
use crate::utils::{generate_wallet, hash_password_with_user_id, verify_password_with_user_id, AppError};

// 注册请求
#[derive(Debug, Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub email: String,
    pub user_name: String,
    pub user_password: String,
    pub user_type: UserType,
}

// 注册响应
#[derive(Debug, Serialize, ToSchema)]
pub struct RegisterResponse {
    pub user_id: Uuid,
    pub message: String,
}

// 验证请求
#[derive(Debug, Deserialize, ToSchema)]
pub struct VerifyRequest {
    pub email: String,
    pub code: String,
}

// 验证响应
#[derive(Debug, Serialize, ToSchema)]
pub struct VerifyResponse {
    pub token: String,
    pub user: UserInfo,
}

// 登录请求
#[derive(Debug, Deserialize, ToSchema)]
pub struct LoginRequest {
    pub email: String,
    pub user_password: String,
}

// 登录响应
#[derive(Debug, Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

// 用户信息
#[derive(Debug, Serialize, ToSchema)]
pub struct UserInfo {
    pub user_id: Uuid,
    pub email: String,
    pub user_name: String,
    pub user_type: UserType,
    pub wallet_address: String,
    pub premium_balance: i64,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserInfo {
    fn from(user: User) -> Self {
        Self {
            user_id: user.user_id,
            email: user.email,
            user_name: user.user_name,
            user_type: user.user_type,
            wallet_address: user.wallet_address,
            premium_balance: user.premium_balance,
            created_at: user.created_at,
        }
    }
}

// 系统信息响应
#[derive(Debug, Serialize, ToSchema)]
pub struct SystemInfoResponse {
    pub chain_name: String,
    pub chain_url: String,
    pub premium_payment_rate: i64,
    pub premium_to_usd: i64,
    pub premium_free: i64,
    pub premium_period: i64,
    pub premium_start: bool,
}

// 获取系统信息
#[utoipa::path(
    get,
    path = "/api/users/system_info",
    tag = "users",
    summary = "获取系统信息",
    description = "获取当前系统的信息",
    responses(
        (status = 200, description = "系统信息获取成功", body = SystemInfoResponse),
        (status = 500, description = "内部服务器错误", body = crate::openapi::ErrorResponse),
    )
)]
pub async fn get_system_info(
    State(state): State<AppState>,
) -> Result<Json<SystemInfoResponse>, AppError> {
    let system_info = SystemInfoResponse {
        chain_name: state.blockchain_name,
        chain_url: state.blockchain_rpc_url,
        premium_payment_rate: state.premium_payment_rate,
        premium_to_usd: state.premium_to_usd,
        premium_free: state.premium_free,
        premium_period: state.premium_period,
        premium_start: state.premium_start,
    };
    Ok(Json(system_info))
}

// 用户注册
#[utoipa::path(
    post,
    path = "/api/users/register",
    tag = "users",
    summary = "Register a new user",
    description = "Register a new user account",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "Registration successful", body = RegisterResponse),
        (status = 400, description = "Bad request, invalid parameters", body = crate::openapi::ErrorResponse),
        (status = 422, description = "Email already registered", body = crate::openapi::ErrorResponse)
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, AppError> {
    // 验证邮箱格式
    if !crate::utils::is_valid_email(&payload.email) {
        return Err(AppError::BadRequest("Invalid email format".to_string()));
    }

    // 检查邮箱是否已存在
    let existing_user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = ?",
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    if existing_user.is_some() {
        return Err(AppError::UnprocessableEntity("Email already registered".to_string()));
    }

    // 检查是否有相同邮箱的待注册信息
    let pending_exists = {
        let pending = state.pending_registrations.lock().unwrap();
        pending.contains_key(&payload.email)
    };

    if pending_exists {
        return Err(AppError::UnprocessableEntity("Email is already in registration process, please verify or wait for expiration".to_string()));
    }

    // 验证用户类型
    match payload.user_type {
        UserType::Gen | UserType::Dev => (),
        // _ => return Err(AppError::UnprocessableEntity("Invalid user type".to_string())),
    }

    // 生成验证码
    let code = generate_verification_code();
    let now = Utc::now();
    let verification_code = VerificationCode {
        code: code.clone(),
        expires_at: now + Duration::minutes(10),
        email: payload.email.clone(),
    };

    // 存储验证码
    state.verification_codes.lock().unwrap().insert(
        payload.email.clone(),
        verification_code,
    );

    // 存储待验证的注册信息
    let pending_registration = PendingRegistration {
        email: payload.email.clone(),
        user_name: payload.user_name,
        user_password: payload.user_password,
        user_type: payload.user_type,
        created_at: now,
    };

    state.pending_registrations.lock().unwrap().insert(
        payload.email.clone(),
        pending_registration,
    );

    // 模拟发送邮件（实际应用中应该调用邮件服务）
    info!("Verification code for {}: {}", payload.email, code);

    Ok(Json(RegisterResponse {
        user_id: Uuid::nil(), // 暂时返回空ID，因为用户还未创建
        message: "Registration request submitted, verification code sent to your email, please verify to complete registration".to_string(),
    }))
}

// 验证邮箱
#[utoipa::path(
    post,
    path = "/api/users/verify",
    tag = "users",
    summary = "Verify email",
    description = "Verify email address using verification code",
    request_body = VerifyRequest,
    responses(
        (status = 200, description = "Verification successful", body = VerifyResponse),
        (status = 400, description = "Verification failed, invalid code or expired", body = crate::openapi::ErrorResponse)
    )
)]
pub async fn verify(
    State(state): State<AppState>,
    Json(payload): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, AppError> {
    // 检查验证码
    let verification_code = {
        let codes = state.verification_codes.lock().unwrap();
        codes.get(&payload.email).cloned()
    };

    let verification_code = verification_code.ok_or_else(|| {
        AppError::BadRequest("Verification failed, invalid code or expired".to_string())
    })?;

    if verification_code.code != payload.code || verification_code.expires_at < Utc::now() {
        // 验证失败，清理临时数据
        state.verification_codes.lock().unwrap().remove(&payload.email);
        state.pending_registrations.lock().unwrap().remove(&payload.email);
        return Err(AppError::BadRequest("Verification failed, invalid code or expired".to_string()));
    }

    // 获取待验证的注册信息
    let pending_registration = {
        let pending = state.pending_registrations.lock().unwrap();
        pending.get(&payload.email).cloned()
    };

    let pending_registration = pending_registration.ok_or_else(|| {
        AppError::BadRequest("Verification failed, registration information does not exist, please re-register".to_string())
    })?;

    // 验证通过，开始创建用户
    // 生成钱包地址和私钥
    let (private_key, wallet_address) = generate_wallet(&state.password_master_key, &state.password_nonce);
    
    // 创建用户
    let user_id = Uuid::new_v4();
    let now = Utc::now();
    
    // 哈希密码
    let hashed_password = hash_password_with_user_id(&pending_registration.user_password, user_id, &state.password_salt);

    sqlx::query(
        r#"
        INSERT INTO users (user_id, email, user_name, user_password, user_type, private_key, wallet_address, premium_balance, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        "#,
    )
    .bind(user_id)
    .bind(&pending_registration.email)
    .bind(&pending_registration.user_name)
    .bind(&hashed_password)
    .bind(match pending_registration.user_type {
        UserType::Gen => "gen",
        UserType::Dev => "dev",
    })
    .bind(&private_key)
    .bind(&wallet_address)
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    // 获取创建的用户信息
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE user_id = ?",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    // 生成JWT token
    let claims = Claims::new(user.user_id);
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::InternalServerError)?;

    // 清理临时数据
    state.verification_codes.lock().unwrap().remove(&payload.email);
    state.pending_registrations.lock().unwrap().remove(&payload.email);

    Ok(Json(VerifyResponse {
        token,
        user: user.into(),
    }))
}

// 用户登录
#[utoipa::path(
    post,
    path = "/api/users/login",
    tag = "users",
    summary = "Login user",
    description = "User login to get access token",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Email or password incorrect", body = crate::openapi::ErrorResponse),
        (status = 404, description = "User not found", body = crate::openapi::ErrorResponse)
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    info!("User Login Begin: {:?}", payload);
    // 检查用户是否存在
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = ?",
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    let user = user.ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    // 验证密码
    if !verify_password_with_user_id(&payload.user_password, user.user_id, &user.user_password, &state.password_salt) {
        return Err(AppError::Unauthorized("Email or password incorrect".to_string()));
    }

    // 生成JWT token
    let claims = Claims::new(user.user_id);
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::InternalServerError)?;
    info!("User Login Over: {:?}", user);
    Ok(Json(LoginResponse {
        token,
        user: user.into(),
    }))
}

// 获取用户信息
#[utoipa::path(
    get,
    path = "/api/users/profile",
    tag = "users",
    summary = "Get user profile",
    description = "Get detailed information of the current logged-in user",
    security(
        ("bearer_auth" = [])
    ),
    responses(
        (status = 200, description = "Get user profile successful", body = UserInfo),
        (status = 401, description = "Unauthorized access", body = crate::openapi::ErrorResponse),
        (status = 404, description = "User not found", body = crate::openapi::ErrorResponse)
    )
)]
pub async fn get_profile(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<UserInfo>, AppError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE user_id = ?",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(user.into()))
}

// 生成6位数字验证码
fn generate_verification_code() -> String {
    let mut rng = rand::rng();
    format!("{:06}", rng.random_range(100000..999999))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::{create_pool, init_database};

    async fn create_test_state() -> AppState {
        let pool = create_pool().await.expect("Failed to create test pool");
        init_database(&pool).await.expect("Failed to init test database");
        
        AppState::new(pool)
    }

    #[test]
    fn test_generate_verification_code() {
        let code = generate_verification_code();
        assert_eq!(code.len(), 6);
        assert!(code.chars().all(|c| c.is_ascii_digit()));
        
        let code_num: u32 = code.parse().unwrap();
        assert!(code_num >= 100000 && code_num <= 999999);
    }

    #[test]
    fn test_generate_verification_code_uniqueness() {
        let mut codes = std::collections::HashSet::new();
        
        // 生成100个验证码，检查是否有重复
        for _ in 0..100 {
            let code = generate_verification_code();
            codes.insert(code);
        }
        
        // 虽然理论上可能有重复，但概率很低
        assert!(codes.len() > 90); // 允许少量重复
    }

    #[tokio::test]
    async fn test_register_valid_user() {
        let state = create_test_state().await;
        
        let request = RegisterRequest {
            email: "test@example.com".to_string(),
            user_name: "Test User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };

        let result = register(State(state), Json(request)).await;
        assert!(result.is_ok());
        
        let response = result.unwrap();
        assert!(!response.user_id.to_string().is_empty());
        assert!(response.message.contains("Verification code sent"));
    }

    #[tokio::test]
    async fn test_register_invalid_email() {
        let state = create_test_state().await;
        
        let request = RegisterRequest {
            email: "invalid-email".to_string(),
            user_name: "Test User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };

        let result = register(State(state), Json(request)).await;
        assert!(result.is_err());
        
        match result.unwrap_err() {
            AppError::BadRequest(msg) => assert!(msg.contains("Email format is incorrect")),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_register_duplicate_email() {
        let state = create_test_state().await;
        
        let request1 = RegisterRequest {
            email: "duplicate@example.com".to_string(),
            user_name: "Test User 1".to_string(),
            user_password: "test_password1".to_string(),
            user_type: UserType::Gen,
        };

        let request2 = RegisterRequest {
            email: "duplicate@example.com".to_string(),
            user_name: "Test User 2".to_string(),
            user_password: "test_password2".to_string(),
            user_type: UserType::Dev,
        };

        // 第一次注册应该成功
        let result1 = register(State(state.clone()), Json(request1)).await;
        assert!(result1.is_ok());

        // 第二次注册相同邮箱应该失败
        let result2 = register(State(state), Json(request2)).await;
        assert!(result2.is_err());
        
        match result2.unwrap_err() {
            AppError::UnprocessableEntity(msg) => {
                assert!(msg.contains("邮箱已被注册") || msg.contains("该邮箱正在注册中"));
            },
            _ => panic!("Expected UnprocessableEntity error"),
        }
    }

    #[tokio::test]
    async fn test_verify_valid_code() {
        let state = create_test_state().await;
        let email = "verify@example.com";
        
        // 先注册用户
        let register_request = RegisterRequest {
            email: email.to_string(),
            user_name: "Verify User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };
        
        let register_result = register(State(state.clone()), Json(register_request)).await;
        if let Err(ref e) = register_result {
            info!("Register error: {:?}", e);
        }
        assert!(register_result.is_ok());

        // 检查用户是否真的被插入到数据库中
        let user_check = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
            .bind(email)
            .fetch_optional(&state.db)
            .await;
        info!("User check result: {:?}", user_check);

        // 获取生成的验证码
        let verification_codes = state.verification_codes.lock().unwrap();
        let verification_code = verification_codes.get(email).unwrap();
        let code = verification_code.code.clone();
        drop(verification_codes);

        // 验证邮箱
        let verify_request = VerifyRequest {
            email: email.to_string(),
            code,
        };

        let result = verify(State(state), Json(verify_request)).await;
        if let Err(ref e) = result {
            info!("Verify error: {:?}", e);
        }
        assert!(result.is_ok());
        
        let response = result.unwrap();
        assert!(!response.token.is_empty());
        assert_eq!(response.user.email, email);
    }

    #[tokio::test]
    async fn test_verify_invalid_code() {
        let state = create_test_state().await;
        let email = "invalid@example.com";
        
        // 先注册用户
        let register_request = RegisterRequest {
            email: email.to_string(),
            user_name: "Invalid User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };
        
        let register_result = register(State(state.clone()), Json(register_request)).await;
        assert!(register_result.is_ok());

        // 使用错误的验证码
        let verify_request = VerifyRequest {
            email: email.to_string(),
            code: "000000".to_string(),
        };

        let result = verify(State(state), Json(verify_request)).await;
        assert!(result.is_err());
        
        match result.unwrap_err() {
            AppError::BadRequest(msg) => assert!(msg.contains("Verification code is incorrect or expired")),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_verify_expired_code() {
        let state = create_test_state().await;
        let email = "expired@example.com";
        
        // 先注册用户
        let register_request = RegisterRequest {
            email: email.to_string(),
            user_name: "Expired User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };
        
        let register_result = register(State(state.clone()), Json(register_request)).await;
        assert!(register_result.is_ok());

        // 手动设置过期的验证码
        {
            let mut verification_codes = state.verification_codes.lock().unwrap();
            let expired_code = VerificationCode {
                email: email.to_string(),
                code: "123456".to_string(),
                expires_at: Utc::now() - Duration::minutes(10), // 10分钟前过期
            };
            verification_codes.insert(email.to_string(), expired_code);
        }

        // 使用过期的验证码
        let verify_request = VerifyRequest {
            email: email.to_string(),
            code: "123456".to_string(),
        };

        let result = verify(State(state), Json(verify_request)).await;
        assert!(result.is_err());
        
        match result.unwrap_err() {
            AppError::BadRequest(msg) => assert!(msg.contains("Verification code is incorrect or expired")),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_login_existing_user() {
        let state = create_test_state().await;
        let email = "login@example.com";
        
        // 先注册并验证用户
        let register_request = RegisterRequest {
            email: email.to_string(),
            user_name: "Login User".to_string(),
            user_password: "test_password".to_string(),
            user_type: UserType::Gen,
        };
        
        let _ = register(State(state.clone()), Json(register_request)).await.unwrap();
        
        // 获取验证码并验证
        let verification_codes = state.verification_codes.lock().unwrap();
        let code = verification_codes.get(email).unwrap().code.clone();
        drop(verification_codes);
        
        let verify_request = VerifyRequest {
            email: email.to_string(),
            code,
        };
        
        let _ = verify(State(state.clone()), Json(verify_request)).await.unwrap();

        // 现在测试登录
        let login_request = LoginRequest {
            email: email.to_string(),
            user_password: "test_password".to_string(),
        };

        let result = login(State(state), Json(login_request)).await;
        assert!(result.is_ok());
        
        let response = result.unwrap();
        assert!(!response.token.is_empty());
        assert_eq!(response.user.email, email);
    }

    #[tokio::test]
    async fn test_login_nonexistent_user() {
        let state = create_test_state().await;
        
        let login_request = LoginRequest {
            email: "nonexistent@example.com".to_string(),
            user_password: "any_password".to_string(),
        };

        let result = login(State(state), Json(login_request)).await;
        assert!(result.is_err());
        
        match result.unwrap_err() {
            AppError::NotFound(msg) => assert!(msg.contains("User not found")),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_login_wrong_password() {
        let state = create_test_state().await;
        let email = "wrong_password@example.com";
        
        // 先注册并验证用户
        let register_request = RegisterRequest {
            email: email.to_string(),
            user_name: "Wrong Password User".to_string(),
            user_password: "correct_password".to_string(),
            user_type: UserType::Gen,
        };
        
        let _ = register(State(state.clone()), Json(register_request)).await.unwrap();
        
        // 获取验证码并验证
        let verification_codes = state.verification_codes.lock().unwrap();
        let code = verification_codes.get(email).unwrap().code.clone();
        drop(verification_codes);
        
        let verify_request = VerifyRequest {
            email: email.to_string(),
            code,
        };
        
        let _ = verify(State(state.clone()), Json(verify_request)).await.unwrap();

        // 使用错误密码登录
        let login_request = LoginRequest {
            email: email.to_string(),
            user_password: "wrong_password".to_string(),
        };

        let result = login(State(state), Json(login_request)).await;
        assert!(result.is_err());
        
        match result.unwrap_err() {
            AppError::Unauthorized(msg) => assert!(msg.contains("Email or password is incorrect")),
            _ => panic!("Expected Unauthorized error"),
        }
    }
}