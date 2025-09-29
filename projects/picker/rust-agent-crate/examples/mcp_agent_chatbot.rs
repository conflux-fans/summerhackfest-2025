// 基于MCP的AI Agent聊天机器人示例
use rust_agent::{run_agent, ChatModel, OpenAIChatModel, McpClient, SimpleMcpClient, McpTool, McpAgent};
use std::sync::Arc;
use std::collections::HashMap;
use chrono;
use serde_json::{Value, json};
use anyhow::Error;

#[tokio::main]
async fn main() {
    println!("=== Rust Agent 使用示例 ===");
    // 从环境变量获取API密钥和基本URL
    let api_key = std::env::var("OPENAI_API_KEY").unwrap_or_else(|_| "OPENAI_API_KEY".to_string());
    let base_url = std::env::var("OPENAI_API_URL").ok();
    let mcp_url = std::env::var("MCP_URL").unwrap_or("http://localhost:8000/mcp".to_string());
    
    // 创建OpenAI模型实例 - 支持Openai兼容 API
    let model = OpenAIChatModel::new(api_key.clone(), base_url)
        .with_model("kimi-k2-0905-preview".to_string())
        .with_temperature(0.6)
        .with_max_tokens(8*1024);
    
    // 初始化MCP客户端
    // 在初始化 MCP 客户端后，自定义工具和工具处理器
    let mut mcp_client = SimpleMcpClient::new(mcp_url.clone());
    
    // 清空默认工具（可选）
    mcp_client.clear_tools();
    
    // 添加自定义工具
    mcp_client.add_tools(vec![
        McpTool {
            name: "get_weather".to_string(),
            description: "Get the weather information for a specified city. For example: 'What's the weather like in Beijing?'".to_string(),
        },
        McpTool {
            name: "simple_calculate".to_string(),
            description: "Perform simple mathematical calculations. For example: 'What is 9.11 plus 9.8?'".to_string(),
        },
    ]);
    
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
        let expression = expression_value.as_str().ok_or_else(|| Error::msg("Expression format error"))?;
        
        // 解析表达式，提取操作数和运算符
        let result = parse_and_calculate(expression)?;
        
        Ok(json!({
            "expression": expression,
            "result": result,
            "calculated_at": chrono::Utc::now().to_rfc3339()
        }))
    });

// 解析表达式并计算结果
fn parse_and_calculate(expression: &str) -> Result<f64, Error> {
    println!("原始表达式: {}", expression);
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
                        return Err(Error::msg("除数不能为零"));
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
    
    Err(Error::msg(format!("Failed to parse expression: {}", expression)))
}
    
    // 连接到 MCP 服务器
    if let Err(e) = mcp_client.connect(&mcp_url).await {
        println!("Failed to connect to MCP server: {}", e);
        println!("Using mock tools instead...");
    }

    println!("Using model: {}", model.model_name().unwrap_or("Model not specified"));
    println!("Using API URL: {}", model.base_url());
    println!("----------------------------------------");
    
    let client_arc: Arc<dyn McpClient> = Arc::new(mcp_client);
    
    // 创建Agent实例，并传递temperature和max_tokens参数
    let mut agent = McpAgent::new(
        client_arc.clone(),
        model.model_name().unwrap_or("kimi-k2-0905-preview").to_string(),
        "You are an AI assistant that can use tools to answer user questions. Please decide whether to use tools based on the user's needs.".to_string()
    )
    .with_temperature(0.6f32)  // 使用与模型相同的温度设置，显式指定为f32类型
    .with_max_tokens(100*1024);  // 使用与模型相同的最大令牌数
    
    // 自动从MCP客户端获取工具并添加到Agent
    if let Err(e) = agent.auto_add_tools().await {
        println!("Failed to auto add tools to McpAgent: {}", e);
    }
    
    println!("基于MCP的AI Agent聊天机器人已启动！");
    println!("输入'退出'结束对话");
    println!("----------------------------------------");
    println!("Using tools example:");
    let tools = client_arc.get_tools().await.unwrap_or_else(|e| {
        println!("Failed to get tools from MCP server: {}", e);
        vec![]
    });
    
    // 打印工具列表
    let mut index = 0;
    for tool in &tools {
        index += 1;

        println!("{index}. {}: {}", tool.name, tool.description);
    }
    
    println!("----------------------------------------");
    // 对话循环
    loop {
        println!("你: ");
        let mut user_input = String::new();
        std::io::stdin().read_line(&mut user_input).expect("读取输入失败");
        println!("");
        let user_input = user_input.trim();
        
        if user_input.to_lowercase() == "退出" || user_input.to_lowercase() == "exit" {
            println!("再见！");
            break;
        }
        
        // 运行Agent
        match run_agent(&agent, user_input.to_string()).await {
            Ok(response) => {
                println!("助手: ");
                println!("{}", response);
            },
            Err(e) => {
                println!("Failed to run agent: {}", e);
            },
        }
        
        println!("----------------------------------------");
    }
    
    // 断开MCP连接
    if let Err(e) = client_arc.disconnect().await {
        println!("Failed to disconnect MCP client: {}", e);
    }
}