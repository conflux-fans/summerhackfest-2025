use tauri::{command, State};
use rust_agent::{ChatModel, OpenAIChatModel, McpClient, SimpleMcpClient, McpTool, McpAgent, run_agent};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use serde_json::{Value, json};
use chrono;
use anyhow::Error;
use log::info;
use super::task::{list_tasks, run_task};
use tauri::AppHandle;

// 定义会话状态结构体
#[derive(Default, Clone)]
pub struct ChatbotState {
    // 存储每个会话的Agent实例
    agents: HashMap<String, Arc<McpAgent>>,
    // 存储MCP客户端
    mcp_client: Option<Arc<dyn McpClient>>,
    // 存储每个会话的消息历史
    message_histories: HashMap<String, Vec<ChatMessage>>,
}

// 2. 在发送消息时，将消息添加到历史记录中
#[command]
pub async fn send_chat_message(state: State<'_, Arc<Mutex<ChatbotState>>>, request: ChatRequest) -> Result<ChatResponse, String> {
    let mut chatbot_state = state.lock().await;
    info!("Send message to session: {}, message: {}", request.session_id, request.message);
    // 获取会话对应的Agent
    match chatbot_state.clone().agents.get(&request.session_id) {
        Some(agent) => {
            // 创建用户消息并添加到历史记录
            let user_message = ChatMessage {
                id: format!("msg_{}_{}", request.session_id, chrono::Utc::now().timestamp_millis()),
                content: request.message.clone(),
                sender: "user".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
                message_type: "text".to_string(),
            };
            info!("Add user message to history: {:?}", user_message);
            // 将会话消息添加到历史记录
            chatbot_state.message_histories
                .entry(request.session_id.clone())
                .or_default()
                .push(user_message);
            
            // 运行Agent处理用户消息
            info!("Run agent request.message: {:?}", request.message.clone());
            match run_agent(agent.as_ref(), request.message.clone()).await {
                Ok(response) => {
                    info!("Send message to agent: {}, and get response: {}", request.message.clone(), response);
                    
                    // 创建机器人回复消息并添加到历史记录
                    let bot_message = ChatMessage {
                        id: format!("msg_{}_{}", request.session_id, chrono::Utc::now().timestamp_millis()),
                        content: response.clone(),
                        sender: "bot".to_string(),
                        timestamp: chrono::Utc::now().to_rfc3339(),
                        message_type: "text".to_string(),
                    };
                    
                    // 将会话消息添加到历史记录
                    chatbot_state.message_histories
                        .entry(request.session_id.clone())
                        .or_default()
                        .push(bot_message);
                    
                    Ok(ChatResponse {
                        success: true,
                        message: Some(response),
                        error: None
                    })
                },
                Err(e) => {
                    info!("Failed to process message: {}", e);
                    Ok(ChatResponse {
                        success: false,
                        message: None,
                        error: Some(format!("Failed to process message: {}", e))
                    })
                }
            }
        },
        None => {
            Err("Session does not exist".to_string())
        }
    }
}

// 3. 添加获取会话历史消息的API
#[command]
pub async fn get_chat_history(state: State<'_, Arc<Mutex<ChatbotState>>>, session_id: String) -> Result<String, String> {
    let chatbot_state = state.lock().await;
    
    // 检查会话是否存在
    if let Some(messages) = chatbot_state.message_histories.get(&session_id) {
        // 将消息历史转换为JSON字符串
        let messages_json = serde_json::to_string(messages).map_err(|e| e.to_string())?;
        Ok(messages_json)
    } else {
        // 如果会话不存在或没有历史消息，返回空数组
        Ok("[]".to_string())
    }
}

// 4. 在删除会话时，同时删除消息历史
#[command]
pub async fn delete_chat_session(state: State<'_, Arc<Mutex<ChatbotState>>>, session_id: String) -> Result<(), String> {
    let mut chatbot_state = state.lock().await;
    
    // 检查会话是否存在并删除
    if chatbot_state.agents.remove(&session_id).is_some() {
        // 同时删除消息历史
        chatbot_state.message_histories.remove(&session_id);
        Ok(())
    } else {
        Err("Session does not exist".to_string())
    }
}

// 定义消息结构体，用于序列化和反序列化
#[derive(Debug, Clone,Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub content: String,
    pub sender: String,
    pub timestamp: String,
    pub message_type: String,
}

// 定义聊天请求结构体
#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub session_id: String,
    pub message: String,
}

// 定义聊天响应结构体
#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub success: bool,
    pub message: Option<String>,
    pub error: Option<String>,
}

// 解析表达式并计算结果
fn parse_and_calculate(expression: &str) -> Result<f64, Error> {
    let expression = expression.replace(" ", "");
    
    // 尝试匹配不同的运算符
    for op_char in ["+", "-", "*", "/"].iter() {
        if let Some(pos) = expression.find(op_char) {
            // 提取左右操作数
            let left_str = &expression[0..pos];
            let right_str = &expression[pos + 1..];
            
            // 转换为浮点数
            let left = left_str.parse::<f64>().map_err(|e| 
                Error::msg(format!("Left operand format error: {}", e)))?;
            let right = right_str.parse::<f64>().map_err(|e| 
                Error::msg(format!("Right operand format error: {}", e)))?;
            
            // 执行相应的运算
            let result = match *op_char {
                "+" => left + right,
                "-" => left - right,
                "*" => left * right,
                "/" => {
                    if right == 0.0 {
                        return Err(Error::msg("Divisor cannot be zero"));
                    }
                    left / right
                },
                _ => unreachable!()
            };
            
            return Ok(result);
        }
    }
    
    // 如果没有找到运算符，尝试将整个表达式解析为数字
    if let Ok(number) = expression.parse::<f64>() {
        return Ok(number);
    }
    
    Err(Error::msg(format!("Cannot parse expression: {}", expression)))
}

// 初始化MCP客户端
async fn init_mcp_client(app_handle: AppHandle) -> Result<Arc<dyn McpClient>, Error> {
    // 从环境变量获取配置
    let mcp_url = std::env::var("MCP_URL").unwrap_or("http://localhost:8000/mcp".to_string());
    
    // 初始化MCP客户端
    let mut mcp_client = SimpleMcpClient::new(mcp_url.clone());
    
    // 清空默认工具（可选）
    mcp_client.clear_tools();

    // 读取本地任务工具并添加到MCP客户端
    let app_handle_clone = app_handle.clone();
    let tasks = list_tasks(app_handle_clone).await.unwrap_or_default();
    for task in tasks.clone() {
        info!("Add tool from local task: {:?}", task);
        mcp_client.add_tool(task.into());
    }
    
    // 添加自定义工具
    mcp_client.add_tools(vec![
        McpTool {
            name: "get_weather".to_string(),
            description: format!(
                "Get weather information for a specified city. For example: 'What's the weather like in Beijing?'.
                The parameter request body you should extract is: '\"parameters\": {{ \"city\": \"{}\" }}'",
                "city".to_string()),
        },
        McpTool {
            name: "simple_calculate".to_string(),
            description: format!(
                "Execute simple mathematical calculations. For example: 'What is 9.11 plus 9.8?'.
                The parameter request body you should extract is: '\"parameters\": {{ \"expression\": \"{}\" }}'",
                "expression".to_string()),
        },
    ]);

    let available_tools = mcp_client.available_tools.clone();
    info!("Available tools: {:?}", available_tools);

    // 注册本地任务工具到MCP客户端
    for task in tasks {
        // 克隆需要在闭包中使用的字段
        let task_status = task.status.clone();
        let task_installed = task.installed.clone();
        let task_runs = task.runs;
        let task_last_run = task.last_run.clone();
        let app_handle_clone_closure = app_handle.clone();
        
        mcp_client.register_tool_handler(task.id.clone(), move |params: HashMap<String, Value>| {
            let task_status = task_status.clone();
            let task_installed = task_installed.clone();
            let task_runs = task_runs;
            let task_last_run = task_last_run.clone();
            let app_handle_for_task = app_handle_clone_closure.clone();
            
            async move {
                let task_id = params.get("task_id").ok_or_else(|| Error::msg("Missing task_id"))?;
                let task_id = task_id.as_str().ok_or_else(|| Error::msg("Invalid task_id format"))?;
                
                // 调用run_task执行任务
                if let Err(err) = run_task(app_handle_for_task, task_id.to_string()).await {
                    return Err(Error::msg(format!("Failed to run task: {}", err)));
                }
                
                Ok(json!({
                    "task_id": task_id,
                    "status": task_status.map(|s| format!("{:?}", s)).unwrap_or("Unknown".to_string()),
                    "installed": task_installed,
                    "runs": task_runs,
                    "last_run": task_last_run,
                }))
            }
        });
    }
    
    // 注册自定义工具处理器
    mcp_client.register_tool_handler("get_weather".to_string(), |params: HashMap<String, Value>| async move {
        let default_city = Value::String("Shanghai".to_string());
        let city_value = params.get("city").unwrap_or(&default_city);
        let city = city_value.as_str().unwrap_or("Shanghai");
        Ok(json!({
            "city": city,
            "temperature": "25°C",
            "weather": "Sunny",
            "humidity": "40%",
            "updated_at": chrono::Utc::now().to_rfc3339()
        }))
    });
    
    mcp_client.register_tool_handler("simple_calculate".to_string(), |params: HashMap<String, Value>| async move {
        let expression_value = params.get("expression").ok_or_else(|| Error::msg("Missing calculation expression"))?;
        let expression = expression_value.as_str().ok_or_else(|| Error::msg("Invalid expression format"))?;
        
        let result = parse_and_calculate(expression)?;
        
        Ok(json!({
            "expression": expression,
            "result": result,
            "calculated_at": chrono::Utc::now().to_rfc3339()
        }))
    });

    // 打印 tool_handlers 工具处理器中的工具有哪些
    info!("Tool handlers: {:?}", mcp_client.tool_handlers.keys().collect::<Vec<_>>());
    
    // 连接到 MCP 服务器
    if let Err(e) = mcp_client.connect(&mcp_url).await {
        println!("Failed to connect to MCP server: {}", e);
        println!("Using mock tools instead...");
    }
    
    // 把 mcp_client 转换为Arc<dyn McpClient>
    let client_arc: Arc<dyn McpClient> = Arc::new(mcp_client);
    
    Ok(client_arc)
}

// 创建新的Agent实例
async fn create_agent(mcp_client: Arc<dyn McpClient>) -> Result<McpAgent, Error> {
    // 从环境变量获取API密钥和基本URL
    let api_key = std::env::var("OPENAI_API_KEY").unwrap_or_else(|_| "OPENAI_API_KEY".to_string());
    let base_url = std::env::var("OPENAI_API_URL").ok();
    let model_name = std::env::var("OPENAI_API_MODEL").unwrap_or_else(|_| "".to_string());
    
    // 创建OpenAI模型实例 - 支持MoonShot API
    let model = OpenAIChatModel::new(api_key.clone(), base_url)
        .with_model(model_name.clone());
    
    // 创建Agent实例
    let mut agent = McpAgent::new(
        mcp_client.clone(),
        model.model_name().unwrap_or("chatgpt-4o").to_string(),
        "You are an AI assistant who can use tools to answer user questions. Please decide whether to use tools based on user needs.".to_string()
    )
    .with_temperature(0.6f32)
    .with_max_tokens(8*1024);
    
    // 自动从MCP客户端获取工具并添加到Agent
    if let Err(e) = agent.auto_add_tools().await {
        println!("Failed to auto add tools to McpAgent: {}", e);
    }
    
    Ok(agent)
}

// Tauri命令：初始化聊天机器人
#[command]
pub async fn init_chatbot(state: State<'_, Arc<Mutex<ChatbotState>>>, app_handle: AppHandle) -> Result<(), String> {
    let mut chatbot_state = state.lock().await;
    
    // 检查是否已经初始化MCP客户端
    if chatbot_state.mcp_client.is_none() {
        match init_mcp_client(app_handle).await {
            Ok(mcp_client) => {
                chatbot_state.mcp_client = Some(mcp_client);
                Ok(())
            },
            Err(e) => Err(format!("Failed to initialize MCP client: {}", e))
        }
    } else {
        Ok(()) // 已经初始化过
    }
}

// Tauri命令：创建新会话
#[command]
pub async fn create_chat_session(state: State<'_, Arc<Mutex<ChatbotState>>>) -> Result<String, String> {
    let mut chatbot_state = state.lock().await;
    
    // 确保MCP客户端已初始化
    let mcp_client = chatbot_state.mcp_client.clone().ok_or_else(|| "MCP客户端未初始化".to_string())?;
    
    // 生成会话ID
    let session_id = format!("session_{}", chrono::Utc::now().timestamp_millis());
    
    // 创建新的Agent实例
    match create_agent(mcp_client).await {
        Ok(agent) => {
            chatbot_state.agents.insert(session_id.clone(), Arc::new(agent));
            Ok(session_id)
        },
        Err(e) => Err(format!("Failed to create Agent: {}", e))
    }
}

// 定义本地可序列化的工具结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct LocalMcpTool {
    pub name: String,
    pub description: String,
}

// Tauri命令：获取可用工具列表
#[command]
pub async fn get_available_tools(state: State<'_, Arc<Mutex<ChatbotState>>>) -> Result<String, String> {
    let chatbot_state = state.lock().await;
    
    // 确保MCP客户端已初始化
    let mcp_client = chatbot_state.mcp_client.clone().ok_or_else(|| "MCP客户端未初始化".to_string())?;
    
    // 获取工具列表
    match mcp_client.get_tools().await {
        Ok(tools) => {
            // 转换为本地可序列化的结构体
            let local_tools: Vec<LocalMcpTool> = tools.into_iter()
                .map(|tool| LocalMcpTool {
                    name: tool.name,
                    description: tool.description,
                })
                .collect();
            
            // 将工具列表转换为JSON字符串
            serde_json::to_string(&local_tools).map_err(|e| e.to_string())
        },
        Err(e) => Err(format!("Failed to get tools list: {}", e))
    }
}

// Tauri命令：列出所有会话
#[command]
pub async fn list_chat_sessions(state: State<'_, Arc<Mutex<ChatbotState>>>) -> Result<String, String> {
    let chatbot_state = state.lock().await;
    
    // 将会话ID列表转换为JSON字符串
    let session_ids: Vec<&String> = chatbot_state.agents.keys().collect();
    let sessions_json = serde_json::to_string(&session_ids).map_err(|e| e.to_string())?;
    
    Ok(sessions_json)
}

// Tauri命令：获取会话详情
#[command]
pub async fn get_chat_session(state: State<'_, Arc<Mutex<ChatbotState>>>, session_id: String) -> Result<String, String> {
    let chatbot_state = state.lock().await;
    
    // 检查会话是否存在
    if let Some(_agent) = chatbot_state.agents.get(&session_id) {
        // 返回会话信息（在实际应用中可以返回更多会话详情）
        let session_info = json!({
            "session_id": session_id,
            "has_agent": true
        });
        
        let session_json = serde_json::to_string(&session_info).map_err(|e| e.to_string())?;
        
        Ok(session_json)
    } else {
        Err(format!("Session {} does not exist", session_id))
    }
}