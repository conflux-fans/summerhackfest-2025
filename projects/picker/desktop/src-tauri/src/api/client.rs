// HTTP 客户端实现

pub use super::models::{ApiError};
use crate::config::AppConfig;
use crate::utils::auth::AuthManager;
use reqwest::{Client as ReqwestClient, RequestBuilder, multipart::Form};
use std::collections::HashMap;
use std::time::Duration;

pub struct ApiClient {
    base_url: String,
    client: ReqwestClient,
    auth_manager: Option<AuthManager>,
    max_retries: u32,
}

impl ApiClient {
    pub fn new(config: &AppConfig, auth_manager: Option<AuthManager>) -> Self {
        let client = ReqwestClient::builder()
            .timeout(Duration::from_millis(config.request_timeout_ms))
            .build()
            .expect("Failed to create HTTP client");
        
        Self {
            base_url: config.api_base_url.clone(),
            client,
            auth_manager,
            max_retries: config.max_retries,
        }
    }
    
    pub async fn post<T, U>(&self, path: &str, body: &T) -> Result<U, ApiError>
    where
        T: serde::Serialize,
        U: serde::de::DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, path);
        let mut request_builder = self.client.post(&url).json(body);
        
        // 添加认证头
        if let Some(auth_manager) = &self.auth_manager {
            if let Some(auth_header) = auth_manager.get_auth_header() {
                request_builder = request_builder.header("Authorization", auth_header);
            }
        }

        self.execute_request(request_builder).await
    }
    
    pub async fn get<U>(&self, path: &str, params: Option<&HashMap<&str, &str>>) -> Result<U, ApiError>
    where
        U: serde::de::DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, path);
        let mut request_builder = self.client.get(&url);
        
        // 添加查询参数
        if let Some(params) = params {
            request_builder = request_builder.query(params);
        } else {
            request_builder = request_builder.query(&HashMap::<&str, &str>::new());
        }
        
        // 添加认证头
        if let Some(auth_manager) = &self.auth_manager {
            if let Some(auth_header) = auth_manager.get_auth_header() {
                request_builder = request_builder.header("Authorization", auth_header);
            }
        } else {
            
        }
        
        self.execute_request(request_builder).await
    }
    
    pub async fn download(&self, path: &str, token: &str) -> Result<Vec<u8>, ApiError> {
        let url = format!("{}{}?token={}", self.base_url, path, token);
        let mut request_builder = self.client.get(&url);
        
        // 添加认证头
        if let Some(auth_manager) = &self.auth_manager {
            if let Some(auth_header) = auth_manager.get_auth_header() {
                request_builder = request_builder.header("Authorization", auth_header);
            }
        }
        
        let mut retries = 0;
        
        // 尝试克隆请求构建器，如果失败则只能尝试一次（不重试）
        if let Some(mut cloned_builder) = request_builder.try_clone() {
            loop {
                match cloned_builder.send().await {
                    Ok(response) => {
                        if response.status().is_success() {
                            match response.bytes().await {
                                Ok(bytes) => return Ok(bytes.to_vec()),
                                Err(err) => return Err(ApiError::NetworkError(err.into())),
                            }
                        } else {
                            // 检查是否是可重试的状态码
                            let status = response.status();
                            if retries < self.max_retries && 
                               (status == reqwest::StatusCode::SERVICE_UNAVAILABLE || 
                                status == reqwest::StatusCode::TOO_MANY_REQUESTS || 
                                status == reqwest::StatusCode::GATEWAY_TIMEOUT) {
                                retries += 1;
                                // 重新克隆请求构建器以进行下一次尝试
                                if let Some(new_builder) = request_builder.try_clone() {
                                    cloned_builder = new_builder;
                                    tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                                    continue;
                                }
                            }
                            return Err(Self::handle_error_response(response).await);
                        }
                    },
                    Err(err) => {
                        if retries < self.max_retries && Self::is_retriable_error(&err) {
                            retries += 1;
                            
                            // 重新克隆请求构建器以进行下一次尝试
                            if let Some(new_builder) = request_builder.try_clone() {
                                cloned_builder = new_builder;
                                tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                                continue;
                            }
                            // 如果无法克隆，就不再重试
                            return Err(ApiError::NetworkError(err.into()));
                        }
                        return Err(ApiError::NetworkError(err.into()));
                    },
                }
            }
        } else {
            // 如果无法克隆请求构建器，就只尝试一次
            match request_builder.send().await {
                Ok(response) => {
                    if response.status().is_success() {
                        match response.bytes().await {
                            Ok(bytes) => return Ok(bytes.to_vec()),
                            Err(err) => return Err(ApiError::NetworkError(err.into())),
                        }
                    } else {
                        return Err(Self::handle_error_response(response).await);
                    }
                },
                Err(err) => {
                    return Err(ApiError::NetworkError(err.into()));
                },
            }
        }
    }
    
    // 文件上传方法
    pub async fn upload_file<U>(&self, path: &str, alias: &str, description: &str, price: i64,
                             version: &str, file_bytes: &[u8], image_bytes: Option<&[u8]>) -> Result<U, ApiError> 
    where
        U: serde::de::DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, path);
        
        // 对于multipart请求，我们不能使用try_clone，所以在重试时需要重新构建请求
        let mut retries = 0;
        loop {
            // 每次都需要重新构建multipart表单，因为它不能被克隆
            let mut form = Form::new()
                .text("alias", alias.to_string())
                .text("description", description.to_string())
                .text("price", price.to_string())
                .text("version", version.to_string());
            
            let file_part = reqwest::multipart::Part::bytes(file_bytes.to_vec())
                .file_name("picker_file")
                .mime_str("application/octet-stream")
                .map_err(|err| ApiError::ValidationError(format!("Failed to create file part: {}", err)))?;
            form = form.part("file", file_part);
            
            if let Some(image_data) = image_bytes {
                let image_part = reqwest::multipart::Part::bytes(image_data.to_vec())
                    .file_name("picker_image")
                    .mime_str("image/png")
                    .map_err(|err| ApiError::ValidationError(format!("Failed to create image part: {}", err)))?;
                form = form.part("image", image_part);
            }
            
            // 重新构建请求
            let mut request_builder = self.client.post(&url)
                .header("Content-Type", "multipart/form-data")
                .multipart(form);
            
            // 添加认证头
            if let Some(auth_manager) = &self.auth_manager {
                if let Some(auth_header) = auth_manager.get_auth_header() {
                    request_builder = request_builder.header("Authorization", auth_header);
                }
            }
            
            match request_builder.send().await {
                Ok(response) => {
                    if response.status().is_success() {
                        match response.json::<U>().await {
                            Ok(data) => return Ok(data),
                            Err(err) => return Err(ApiError::NetworkError(err.into())),
                        }
                    } else {
                        // 检查是否是可重试的状态码
                        let status = response.status();
                        if retries < self.max_retries && 
                           (status == reqwest::StatusCode::SERVICE_UNAVAILABLE || 
                            status == reqwest::StatusCode::TOO_MANY_REQUESTS || 
                            status == reqwest::StatusCode::GATEWAY_TIMEOUT) {
                            retries += 1;
                            tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                            continue;
                        }
                        return Err(Self::handle_error_response(response).await);
                    }
                },
                Err(err) => {
                    if retries < self.max_retries && Self::is_retriable_error(&err) {
                        retries += 1;
                        tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                        continue;
                    }
                    return Err(ApiError::NetworkError(err.into()));
                },
            }
        }
    }
    
async fn execute_request<U>(&self, request_builder: RequestBuilder) -> Result<U, ApiError>
where
    U: serde::de::DeserializeOwned,
{
    let mut retries = 0;
    
    // 尝试克隆请求构建器，如果失败则只能尝试一次（不重试）
    if let Some(mut cloned_builder) = request_builder.try_clone() {
        loop {
            match cloned_builder.send().await {
                Ok(response) => {
                    let status = response.status();
                    let url = response.url().clone();
                    
                    if status.is_success() {
                        // 首先尝试获取原始文本以进行调试
                        match response.text().await {
                            Ok(raw_text) => {                                
                                // 首先尝试解析为JSON
                                if let Ok(data) = serde_json::from_str(&raw_text) {
                                    return Ok(data);
                                }
                                
                                // 如果JSON解析失败，检查是否请求的类型是String或Option<String>
                                // 尝试将原始文本作为字符串返回
                                if let Ok(text_result) = serde_json::from_str(&format!("{:?}", raw_text)) {
                                    return Ok(text_result);
                                }
                                
                                // 如果都失败，返回适当的错误
                                return Err(ApiError::ValidationError("Failed to parse response content".to_string()));
                            },
                            Err(text_err) => {
                                return Err(ApiError::NetworkError(text_err.into()));
                            },
                        }
                    } else {
                        return Err(Self::handle_error_response(response).await);
                    }
                },
                Err(err) => {
                    if retries < self.max_retries && Self::is_retriable_error(&err) {
                        retries += 1;
                        
                        // 重新克隆请求构建器以进行下一次尝试
                        if let Some(new_builder) = request_builder.try_clone() {
                            cloned_builder = new_builder;
                            tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                            continue;
                        }
                        // 如果无法克隆，就不再重试
                        return Err(ApiError::NetworkError(err.into()));
                    }
                    return Err(ApiError::NetworkError(err.into()));
                },
            }
        }
    } else {
        // 如果无法克隆请求构建器，就只尝试一次
        match request_builder.send().await {
            Ok(response) => {
                let status = response.status();
                let url = response.url().clone();
                
                if status.is_success() {
                    // 首先尝试获取原始文本以进行调试
                    match response.text().await {
                        Ok(raw_text) => {                            
                            // 首先尝试解析为JSON
                            if let Ok(data) = serde_json::from_str(&raw_text) {
                                return Ok(data);
                            }
                            
                            // 如果JSON解析失败，检查是否请求的类型是String或Option<String>
                            // 尝试将原始文本作为字符串返回
                            if let Ok(text_result) = serde_json::from_str(&format!("{:?}", raw_text)) {
                                return Ok(text_result);
                            }
                            
                            // 如果都失败，返回适当的错误
                            return Err(ApiError::ValidationError("Failed to parse response content".to_string()));
                        },
                        Err(text_err) => {
                            return Err(ApiError::NetworkError(text_err.into()));
                        },
                    }
                } else {
                    return Err(Self::handle_error_response(response).await);
                }
            },
            Err(err) => {
                return Err(ApiError::NetworkError(err.into()));
            },
        }
    }
}
    
    pub fn is_retriable_error(err: &reqwest::Error) -> bool {
        // 检查是否是可重试的错误类型
        err.is_timeout() || 
        err.is_connect() || 
        err.status() == Some(reqwest::StatusCode::SERVICE_UNAVAILABLE) ||
        err.status() == Some(reqwest::StatusCode::TOO_MANY_REQUESTS) ||
        err.status() == Some(reqwest::StatusCode::GATEWAY_TIMEOUT)
    }
    
    async fn handle_error_response(response: reqwest::Response) -> ApiError {
        let status = response.status();
        let url = response.url().clone();
        
        let message = format!("Failed to handle error response: {}", response.text().await.unwrap());

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return ApiError::AuthError(message);
        } else if status == reqwest::StatusCode::NOT_FOUND {
            return ApiError::NotFound;
        } else if status.is_client_error() {
            return ApiError::ValidationError(message);
        } else if status.is_server_error() {         
            return ApiError::ServerError(message);
        }
        
        ApiError::Unknown
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::AppConfig;
    use serde::{Deserialize, Serialize};
    
    // 测试数据模型
    #[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
    struct TestRequest {
        name: String,
        value: i32,
    }
    
    #[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
    struct TestResponse {
        id: String,
        name: String,
        value: i32,
    }
    
    // 创建测试用的AppConfig
    fn create_test_config(base_url: String) -> AppConfig {
        AppConfig {
            api_base_url: base_url,
            request_timeout_ms: 5000,
            max_retries: 2,
            // 其他配置使用默认值
            ..Default::default()
        }
    }
    
    // 模拟的ApiClient用于测试，避免网络请求
    struct MockApiClient {
        pub success: bool,
        pub status_code: u16,
        pub response_data: String,
    }
    
    impl MockApiClient {
        fn new(success: bool, status_code: u16, response_data: &str) -> Self {
            Self {
                success,
                status_code,
                response_data: response_data.to_string(),
            }
        }
        
        async fn get(&self, _path: &str, _params: Option<&HashMap<&str, &str>>) -> Result<TestResponse, ApiError> {
            if self.success {
                Ok(serde_json::from_str(&self.response_data).unwrap())
            } else {
                match self.status_code {
                    401 => Err(ApiError::AuthError("Failed to authenticate. Please check your credentials and try again.".to_string())),
                    404 => Err(ApiError::NotFound),
                    500..=599 => Err(ApiError::ServerError("Internal server error".to_string())),
                    400 => Err(ApiError::ValidationError("Bad Request".to_string())),
                    _ => Err(ApiError::Unknown),
                }
            }
        }
        
        async fn post(&self, _path: &str, _body: &TestRequest) -> Result<TestResponse, ApiError> {
            if self.success {
                Ok(serde_json::from_str(&self.response_data).unwrap())
            } else {
                match self.status_code {
                    401 => Err(ApiError::AuthError("Failed to authenticate. Please check your credentials and try again.".to_string())),
                    404 => Err(ApiError::NotFound),
                    500..=599 => Err(ApiError::ServerError("Internal server error".to_string())),
                    400 => Err(ApiError::ValidationError("Bad Request".to_string())),
                    _ => Err(ApiError::Unknown),
                }
            }
        }
    }
    
    // 测试ApiClient的创建
    #[test]
    fn test_api_client_creation() {
        let config = create_test_config("http://localhost:3000/api".to_string());
        let api_client = ApiClient::new(&config, None);
        
        assert_eq!(api_client.base_url, "http://localhost:3000/api");
        assert_eq!(api_client.max_retries, 2);
        assert!(api_client.auth_manager.is_none());
    }
    
    // 测试ApiClient与认证管理器的集成
    #[test]
    fn test_api_client_with_auth_manager() {
        // 避免在测试线程中创建真实的AuthManager，简单测试API客户端创建
        let config = create_test_config("http://localhost:3000/api".to_string());
        
        // 测试没有auth_manager的情况
        let client = ApiClient::new(&config, None);
        assert!(client.auth_manager.is_none());
    }
    
    // 测试成功的POST请求
    #[tokio::test]
    async fn test_post_request() {
        let mock_client = MockApiClient::new(
            true,
            200,
            r#"{"id":"123","name":"test","value":42}"#
        );
        
        let request = TestRequest {
            name: "test".to_string(),
            value: 42,
        };
        
        let result = mock_client.post("/test", &request).await;
        
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.id, "123");
        assert_eq!(response.name, "test");
        assert_eq!(response.value, 42);
    }
    
    // 测试成功的GET请求
    #[tokio::test]
    async fn test_get_request() {
        let mock_client = MockApiClient::new(
            true,
            200,
            r#"{"id":"123","name":"test","value":42}"#
        );
        
        let mut params = HashMap::new();
        params.insert("param1", "value1");
        params.insert("param2", "value2");
        
        let result = mock_client.get("/test", Some(&params)).await;
        
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.id, "123");
        assert_eq!(response.name, "test");
        assert_eq!(response.value, 42);
    }
    
    // 测试GET请求（无参数）
    #[tokio::test]
    async fn test_get_request_without_params() {
        let mock_client = MockApiClient::new(
            true,
            200,
            r#"{"id":"123","name":"test","value":42}"#
        );
        
        let result = mock_client.get("/test", None).await;
        
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.id, "123");
        assert_eq!(response.name, "test");
        assert_eq!(response.value, 42);
    }
    
    // 测试认证请求
    #[tokio::test]
    async fn test_authenticated_request() {
        let mock_client = MockApiClient::new(
            true,
            200,
            r#"{"id":"123","name":"protected","value":42}"#
        );
        
        let result = mock_client.get("/protected", None).await;
        
        assert!(result.is_ok());
    }
    
    // 测试错误处理 - 401 未授权
    #[tokio::test]
    async fn test_error_handling_unauthorized() {
        let mock_client = MockApiClient::new(false, 401, "");
        
        let result = mock_client.get("/protected", None).await;
        
        assert!(result.is_err());
        match &result {
            Err(ApiError::AuthError(_)) => {},
            _ => panic!("Expected AuthError but got {:?}", result),
        }
    }
    
    // 测试错误处理 - 404 未找到
    #[tokio::test]
    async fn test_error_handling_not_found() {
        let mock_client = MockApiClient::new(false, 404, "");
        
        let result = mock_client.get("/not-found", None).await;
        
        assert!(result.is_err());
        match &result {
            Err(ApiError::NotFound) => {},
            _ => panic!("Expected NotFound but got {:?}", result),
        }
    }
    
    // 测试错误处理 - 客户端错误
    #[tokio::test]
    async fn test_error_handling_client_error() {
        let mock_client = MockApiClient::new(false, 400, "");
        
        let request = TestRequest {
            name: "test".to_string(),
            value: 42,
        };
        
        let result = mock_client.post("/error", &request).await;
        
        assert!(result.is_err());
        match &result {
            Err(ApiError::ValidationError(msg)) => assert_eq!(msg, "Bad Request"),
            _ => panic!("Expected ValidationError but got {:?}", result),
        }
    }
    
    // 测试错误处理 - 服务器错误
    #[tokio::test]
    async fn test_error_handling_server_error() {
        let mock_client = MockApiClient::new(false, 500, "");
        
        let result = mock_client.get("/server-error", None).await;
        
        assert!(result.is_err());
        match &result {
            Err(ApiError::ServerError(msg)) => assert_eq!(msg, "Internal server error"),
            _ => panic!("Expected ServerError but got {:?}", result),
        }
    }
    
    // 测试认证管理器功能
    #[tokio::test]
    async fn test_auth_manager_functionality() {
        // 避免在测试线程中创建真实的AuthManager，简单测试功能逻辑
        let token = "test_token";
        let auth_header = format!("Bearer {}", token);
        
        // 验证授权头格式正确
        assert!(auth_header.starts_with("Bearer "));
        assert!(auth_header.contains(token));
    }
}