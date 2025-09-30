# Rust Agent Crate

一个用Rust编写的AI Agent框架，提供与大语言模型集成、工具调用、MCP服务连接等功能，帮助开发者构建强大的智能应用。

## 项目简介

Rust-Agent 是一个模块化的智能代理开发框架，设计用于简化基于大语言模型的应用开发。该框架提供了统一的执行接口、灵活的工具集成机制以及与MCP服务的无缝连接能力，使开发者能够快速构建具有推理和工具使用能力的智能应用。

## 核心功能

- **统一执行接口**：基于 `Runnable<I, O>` 接口的统一执行模型，支持同步、异步和流式处理
- **大语言模型集成**：支持OpenAI等主流大语言模型的调用
- **智能代理系统**：提供 `McpAgent` 等代理实现，支持上下文管理和工具调用
- **工具调用机制**：灵活的工具注册和调用系统
- **MCP服务集成**：与MCP服务的连接适配器
- **异步编程支持**：基于Tokio的全异步设计

## 架构概览

项目采用模块化设计，遵循依赖倒置原则和组合优于继承的设计理念。整个框架以 `Runnable<I, O>` 为核心抽象，构建了一个可组合的组件系统。

```
src/
├── lib.rs          # 主入口和公共导出
├── core/           # 核心抽象和接口
├── models/         # 语言模型集成
├── agents/         # 代理实现
├── tools/          # 工具定义和实现
├── mcp/            # MCP服务集成
├── memory/         # 记忆功能（预留模块）
└── callbacks/      # 回调机制（预留模块）
```

### 核心模块关系

1. **Core**: 定义了 `Runnable<I, O>` 等核心接口，是整个框架的基础
2. **Models**: 实现了 `ChatModel` 接口，负责与大语言模型交互
3. **Agents**: 实现了 `Agent` 接口和 `Runnable` 接口，是应用的核心逻辑处理器
4. **Tools**: 提供了工具定义和工具调用相关功能
5. **MCP**: 提供了与MCP服务交互的客户端和适配器

## 架构设计详解

### 1. 核心抽象层 (Core)

Core模块定义了框架的基础抽象，以 `Runnable<I, O>` 接口为中心，提供了统一的执行模型。

```rust
// Runnable接口核心定义
trait Runnable<I: Send + 'static, O: Send + 'static>: Send + Sync {
    // 核心异步调用方法
    fn invoke(&self, input: I) -> Pin<Box<dyn Future<Output = Result<O, Error>> + Send>>;
    
    // 批量处理方法
    fn batch(&self, inputs: Vec<I>) -> Pin<Box<dyn Future<Output = Vec<Result<O, Error>>> + Send>>;
    
    // 流式处理方法
    fn stream(&self, input: I) -> Box<dyn Stream<Item = Result<O, Error>> + Send>;
    
    // 用于克隆组件的辅助方法
    fn clone_to_owned(&self) -> Box<dyn Runnable<I, O> + Send + Sync>;
}
```

该模块还提供了组件组合机制，通过 `pipe` 函数和 `RunnableExt` 扩展trait实现组件间的链式调用，使开发者能够灵活组合各种功能组件。

### 2. 模型层 (Models)

Models模块负责与大语言模型的交互，定义了 `ChatModel` 接口作为统一抽象。

```rust
// ChatModel接口定义
trait ChatModel: Send + Sync {
    // 获取模型名称
    fn model_name(&self) -> Option<&str>;
    
    // 获取基础URL
    fn base_url(&self) -> String;
    
    // 核心方法：处理聊天消息
    fn invoke(&self, messages: Vec<ChatMessage>) -> Pin<Box<dyn Future<Output = Result<ChatCompletion, Error>> + Send + '_>>;
}
```

目前实现了 `OpenAIChatModel`，支持与OpenAI API的交互，包括传统的Chat Completions API和新的Responses API。该实现支持温度控制、最大令牌数设置等参数配置。

### 3. 代理层 (Agents)

Agents模块实现了智能代理的核心逻辑，定义了 `Agent` 接口和 `AgentRunner` 接口。

```rust
// Agent接口定义
trait Agent: Send + Sync {
    // 获取可用工具列表
    fn tools(&self) -> Vec<Box<dyn Tool + Send + Sync>>;
    
    // 执行Agent动作
    fn execute(&self, action: &AgentAction) -> Pin<Box<dyn Future<Output = Result<String, Error>> + Send + '_>>;
    
    // 克隆代理实例
    fn clone_agent(&self) -> Box<dyn Agent>;
}
```

`McpAgent` 是主要的代理实现，它集成了语言模型调用、工具管理和响应生成等功能，并提供了与MCP服务的集成能力。

### 4. 工具层 (Tools)

Tools模块定义了工具的接口和实现机制，以 `Tool` 接口为核心抽象。

```rust
// Tool接口定义
trait Tool: Send + Sync {
    // 获取工具名称
    fn name(&self) -> &str;
    
    // 获取工具描述
    fn description(&self) -> &str;
    
    // 核心执行方法
    fn invoke(&self, input: &str) -> Pin<Box<dyn Future<Output = Result<String, Error>> + Send + '_>>;
    
    // 支持运行时类型检查
    fn as_any(&self) -> &dyn std::any::Any;
}
```

该模块还提供了 `Toolkit` 接口，用于管理一组相关的工具。

### 5. MCP集成层

MCP模块提供了与MCP服务交互的客户端和适配器，定义了 `McpClient` 接口和 `McpToolAdapter` 适配器类。

```rust
// McpClient接口定义
trait McpClient: Send + Sync {
    // 连接到MCP服务器
    fn connect(&mut self, url: &str) -> Pin<Box<dyn Future<Output = Result<(), Error>> + Send + '_>>;
    
    // 获取可用工具列表
    fn get_tools(&self) -> Pin<Box<dyn Future<Output = Result<Vec<McpTool>, Error>> + Send + '_>>;
    
    // 调用指定工具
    fn call_tool(&self, tool_name: &str, params: HashMap<String, Value>) -> Pin<Box<dyn Future<Output = Result<Value, Error>> + Send + '_>>;
    
    // 断开连接
    fn disconnect(&self) -> Pin<Box<dyn Future<Output = Result<(), Error>> + Send + '_>>;
}
```

`SimpleMcpClient` 是 `McpClient` 的基本实现，提供了工具管理和调用功能。`McpToolAdapter` 将MCP工具适配为符合 `Tool` 接口的对象，实现了MCP工具与框架工具系统的无缝集成。

## 设计模式应用

1. **策略模式**：通过 `Runnable`、`ChatModel`、`Agent` 等接口实现算法族的封装和切换
2. **适配器模式**：通过 `McpToolAdapter` 实现MCP工具与框架工具系统的适配
3. **组合模式**：通过 `RunnableSequence` 和 `pipe` 函数实现组件的组合
4. **工厂模式**：各种组件的创建方法如 `new()`、`with_xxx()` 提供了对象创建的统一接口
5. **命令模式**：`AgentAction` 封装了工具调用请求，支持参数化和队列化

## 快速开始

### 安装

在你的 `Cargo.toml` 文件中添加依赖：

```toml
dependencies = {
    rust-agent = "0.0.1"
}
```

### 基本用法

下面是一个使用 `McpAgent` 构建简单对话机器人的示例：

```rust
use rust_agent::{McpAgent, SimpleMcpClient, McpTool, ChatMessage, ChatMessageContent, AgentOutput};
use std::sync::Arc;
use std::collections::HashMap;

// 创建MCP客户端
let mut mcp_client = SimpleMcpClient::new("http://localhost:8080".to_string());

// 添加一些MCP工具
mcp_client.add_tools(vec![
    McpTool {
        name: "get_weather".to_string(),
        description: "获取指定城市的天气信息".to_string(),
    }
]);

// 将MCP客户端包装为Arc
let mcp_client_arc = Arc::new(mcp_client);

// 创建McpAgent实例
let mut agent = McpAgent::new(
    mcp_client_arc.clone(),
    "gpt-3.5-turbo".to_string(),
    "你是一个有用的助手".to_string()
)
.with_temperature(0.7f32)
.with_max_tokens(1000);

// 自动添加来自MCP客户端的工具
if let Err(e) = agent.auto_add_tools().await {
    println!("自动添加工具到 McpAgent 失败: {}", e);
}

// 构建用户输入
let mut input = HashMap::new();
input.insert("input".to_string(), "北京今天的天气怎么样？".to_string());

// 调用代理处理输入
let result = agent.invoke(input).await;

// 处理结果
match result {
    Ok(AgentOutput::Finish(finish)) => {
        if let Some(answer) = finish.return_values.get("answer") {
            println!("AI回复: {}", answer);
        }
    },
    Ok(AgentOutput::Action(action)) => {
        println!("需要调用工具: {}", action.tool);
        // 执行工具调用...
        if let Some(thought) = &action.thought {
            println!("思考: {}", thought);
        }
    },
    Err(e) => {
        println!("发生错误: {}", e);
    }
}
```

## 示例

项目提供了多个示例，展示了如何使用框架构建不同类型的智能应用。示例位于 `examples/` 目录下。

例如，`mcp_agent_chatbot.rs` 示例展示了如何使用 `McpAgent` 构建一个简单的聊天机器人：

```bash
# 运行示例
cargo run --example mcp_agent_chatbot
```

## 配置和环境变量

使用框架时，可能需要配置以下环境变量：

- `OPENAI_API_KEY`: OpenAI API密钥
- `OPENAI_API_URL`: OpenAI API基础URL（可选，默认为OpenAI官方API）

## 注意事项

- 框架使用异步编程模型，需要配合Tokio运行时
- 工具调用需要实现 `Tool` 接口或使用 `McpToolAdapter` 适配器
- 当前版本可能存在一些未实现的功能或简化实现，使用时需要注意

## 开发和贡献

如果你想为项目做贡献，请遵循以下步骤：

1. Fork 仓库
2. 创建你的特性分支
3. 提交你的更改
4. 推送到分支
5. 创建一个 Pull Request

## License

[MIT License](LICENSE)