// MCP客户端接口定义
use std::collections::HashMap;
use serde_json::{json, Value};
use anyhow::Error;
use std::pin::Pin;
use std::future::Future;
use std::sync::Arc;
use log::info;

// MCP工具结构体
#[derive(Debug,Clone)]
pub struct McpTool {
    pub name: String,
    pub description: String,
    // 其他工具相关字段
}

// 简单的MCP客户端实现
// 修改 SimpleMcpClient 结构体，添加工具处理器字段
#[derive(Clone)]
pub struct SimpleMcpClient {
    pub url: String,
    pub available_tools: Vec<McpTool>,
    // 使用Arc包装工具处理器，使其支持克隆
    pub tool_handlers: HashMap<String, Arc<dyn Fn(HashMap<String, Value>) -> Pin<Box<dyn Future<Output = Result<Value, Error>> + Send>> + Send + Sync>>,
}

// impl std::fmt::Debug for SimpleMcpClient {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         f.debug_struct("SimpleMcpClient")
//             .field("url", &self.url)
//             .field("available_tools", &self.available_tools)
//             .field("tool_handlers", &format!("HashMap with {} entries", self.tool_handlers.len()))
//             .finish()
//     }
// }

// 实现 SimpleMcpClient 结构体的方法
impl SimpleMcpClient {
    pub fn new(url: String) -> Self {
        Self {
            url,
            available_tools: Vec::new(),
            tool_handlers: HashMap::new(),
        }
    }
    
    // 添加自定义工具方法
    pub fn add_tool(&mut self, tool: McpTool) {
        self.available_tools.push(tool);
    }
    
    // 注册工具处理器方法
    pub fn register_tool_handler<F, Fut>(&mut self, tool_name: String, handler: F)
    where
        F: Fn(HashMap<String, Value>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Value, Error>> + Send + 'static,
    {
        self.tool_handlers.insert(tool_name, Arc::new(move |params| {
            let params_clone = params.clone();
            Box::pin(handler(params_clone))
        }));
    }
    
    // 批量添加工具方法
    pub fn add_tools(&mut self, tools: Vec<McpTool>) {
        self.available_tools.extend(tools);
    }
    
    // 清空工具列表方法
    pub fn clear_tools(&mut self) {
        self.available_tools.clear();
    }
}

// 为 SimpleMcpClient 实现 McpClient trait
impl McpClient for SimpleMcpClient {
    // 连接到MCP服务器
    fn connect(&mut self, url: &str) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), Error>> + Send + '_>> {
        let url = url.to_string();
        Box::pin(async move {
            self.url = url;
            Ok(())
        })
    }
    
    // 获取可用工具列表
    fn get_tools(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<McpTool>, Error>> + Send + '_>> {
        let tools = self.available_tools.clone();
        Box::pin(async move {
            Ok(tools)
        })
    }
    
    // 调用指定工具
    fn call_tool(&self, tool_name: &str, params: HashMap<String, Value>) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Value, Error>> + Send + '_>> {
        let tool_name = tool_name.to_string();
        let params = params.clone();
        let handler_opt = self.tool_handlers.get(&tool_name).cloned();
        for (tool_name, _handler) in &self.tool_handlers {
            // 我们只能打印键（工具名称），因为值是一个闭包类型
            println!("- Tool: {}", tool_name);
        }
        Box::pin(async move {
            // 检查是否有自定义的工具处理器
            if let Some(handler) = handler_opt {
                // 如果有自定义处理器，调用它
                info!("Calling tool {} with params {:?}", tool_name, params);
                handler(params.clone()).await
            } else {
                // 否则使用默认的处理逻辑
                // 模拟工具调用结果
                match tool_name.as_str() {
                    "get_weather" => {
                        // 绑定默认值到变量以延长生命周期
                        let default_city = Value::String("Beijing".to_string());
                        let city_value = params.get("city").unwrap_or(&default_city);
                        let city = city_value.as_str().unwrap_or("Beijing");
                        Ok(json!({
                            "city": city,
                            "temperature": "25°C",
                            "weather": "cloudy",
                            "humidity": "60%"
                        }))
                    },
                    _ => Err(Error::msg(format!("Unknown tool: {}", tool_name)))
                }
            }
        })
    }
    
    // 断开连接
    fn disconnect(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), Error>> + Send + '_>> {
        Box::pin(async move {
            // 简单实现：模拟断开连接成功
            Ok(())
        })
    }
    
    // 获取工具响应
    fn get_response(&self, tool_call_id: &str) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Value, Error>> + Send + '_>> {
        let tool_call_id = tool_call_id.to_string();
        Box::pin(async move {
            // 简单实现：返回模拟的工具响应
            Ok(serde_json::json!({
                "tool_call_id": tool_call_id,
                "status": "completed",
                "response": {
                    "data": "Sample tool response data"
                }
            }))
        })
    }
    
    // 克隆方法
    fn clone(&self) -> Box<dyn McpClient> {
        // 手动创建 available_tools 的深拷贝
        let tools = self.available_tools.iter().map(|t| McpTool {
            name: t.name.clone(),
            description: t.description.clone()
        }).collect();
        
        // 复制工具处理器
        let tool_handlers = self.tool_handlers.clone();
        
        Box::new(SimpleMcpClient {
            url: self.url.clone(),
            available_tools: tools,
            tool_handlers,
        })
    }
}

// MCP客户端接口
pub trait McpClient: Send + Sync {
    // 连接到MCP服务器
    fn connect(&mut self, _url: &str) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), Error>> + Send + '_>> {
        Box::pin(async move {
            // 简单实现：模拟连接成功
            Ok(())
        })
    }
    
    // 获取可用工具列表
    fn get_tools(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<McpTool>, Error>> + Send + '_>> {
        Box::pin(async move {
            // 简单实现：返回模拟的工具列表
            Ok(vec![McpTool {
                name: "example_tool".to_string(),
                description: "Example tool description".to_string()
            }])
        })
    }
    
    // 调用指定工具
    fn call_tool(&self, tool_name: &str, _params: HashMap<String, Value>) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Value, Error>> + Send + '_>> {
        let tool_name = tool_name.to_string();
        Box::pin(async move {
            // 简单实现：返回工具调用的模拟结果
            Ok(serde_json::json!({
                "tool_name": tool_name,
                "status": "success",
                "result": {
                    "message": "Tool call executed successfully"
                }
            }))
        })
    }
    
    // 断开连接
    fn disconnect(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), Error>> + Send + '_>> {
        Box::pin(async move {
            // 简单实现：模拟断开连接成功
            Ok(())
        })
    }
    
    // 获取工具响应
    fn get_response(&self, tool_call_id: &str) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Value, Error>> + Send + '_>> {
        let tool_call_id = tool_call_id.to_string();
        Box::pin(async move {
            // 简单实现：返回模拟的工具响应
            Ok(serde_json::json!({
                "tool_call_id": tool_call_id,
                "status": "completed",
                "response": {
                    "data": "Sample tool response data"
                }
            }))
        })
    }
    
    // 克隆方法
    fn clone(&self) -> Box<dyn McpClient>;
}
