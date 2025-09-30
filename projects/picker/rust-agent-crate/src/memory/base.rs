// 基础记忆接口定义
use anyhow::Error;
use std::collections::HashMap;
use serde_json::Value;

// 最小化记忆抽象接口（与langchain-core对齐）
pub trait BaseMemory: Send + Sync {
    // 核心方法：加载记忆变量
    fn load_memory_variables(&self, inputs: &HashMap<String, Value>) -> impl std::future::Future<Output = Result<HashMap<String, Value>, Error>> + Send {
        let _inputs = inputs.clone();
        async move {
            unimplemented!();
        }
    }
    
    // 核心方法：保存上下文
    fn save_context(&self, inputs: &HashMap<String, Value>, outputs: &HashMap<String, Value>) -> impl std::future::Future<Output = Result<(), Error>> + Send {
        let _inputs = inputs.clone();
        let _outputs = outputs.clone();
        async move {
            unimplemented!();
        }
    }
    
    // 可选方法：清除记忆
    fn clear(&self) -> impl std::future::Future<Output = Result<(), Error>> + Send {
        async move {
            Ok(())
        }
    }
}