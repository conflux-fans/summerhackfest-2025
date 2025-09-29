// 简单的Chatbot示例
use rust_agent::{ChatMessage, ChatMessageContent, ChatModel, OpenAIChatModel};
use std::collections::HashMap;
use std::env;

#[tokio::main]
async fn main() {
    // 从环境变量获取API密钥和URL（也可以直接硬编码，不推荐用于生产环境）
    let api_key = env::var("OPENAI_API_KEY").expect("请设置OPENAI_API_KEY环境变量");
    let api_url = env::var("OPENAI_API_URL").ok(); // 可选，如果不设置则使用默认URL

    // 创建OpenAI模型实例
    let model = OpenAIChatModel::new(api_key.clone(), api_url.clone())
        .with_model("".to_string())
        .with_temperature(0.7)
        .with_max_tokens(1000);

    println!("简单Chatbot已启动！输入'退出'结束对话");
    println!("使用模型: {}", model.model_name().unwrap_or("未指定"));
    println!("使用API URL: {}", api_url.unwrap_or_else(|| "https://api.openai.com/v1/chat/completions".to_string()));
    println!("----------------------------------------");

    // 创建一个简单的对话循环
    loop {
        // 获取用户输入
        print!("你: ");
        let mut user_input = String::new();
        std::io::stdin().read_line(&mut user_input).expect("读取输入失败");
        let user_input = user_input.trim();

        if user_input.to_lowercase() == "退出" || user_input.to_lowercase() == "exit" {
            println!("再见！");
            break;
        }

        // 创建系统消息（可选）
        let system_message = ChatMessage::System(ChatMessageContent {
            content: "你是一个有用的助手，请用自然、友好的语言回答问题。".to_string(),
            name: None,
            additional_kwargs: HashMap::new(),
        });

        // 创建用户消息
        let user_message = ChatMessage::Human(ChatMessageContent {
            content: user_input.to_string(),
            name: None,
            additional_kwargs: HashMap::new(),
        });

        // 构建消息列表
        let messages = vec![system_message, user_message];

        // 调用模型获取响应
        match model.invoke(messages).await {
            Ok(response) => {
                // 处理响应
                match response.message {
                    ChatMessage::AIMessage(content) => {
                        println!("助手: {}", content.content);
                    }
                    _ => {
                        println!("收到非预期响应类型");
                    }
                }

                // 打印令牌使用情况（如果可用）
                if let Some(usage) = response.usage {
                    println!("[提示词令牌: {}, 完成令牌: {}, 总令牌: {}]",
                        usage.prompt_tokens, usage.completion_tokens, usage.total_tokens);
                }
            }
            Err(e) => {
                println!("发生错误: {}", e);
            }
        }

        println!("----------------------------------------");
    }
}