// MCP服务器抽象定义
use anyhow::Error;
use crate::tools::Tool;

// MCP服务器抽象
pub trait McpServer: Send + Sync {
    // 启动MCP服务器
    async fn start(&self, address: &str) -> Result<(), Error> {
        let _address = address;
        unimplemented!();
    }
    
    // 注册工具到MCP服务器
    fn register_tool(&self, tool: Box<dyn Tool>) -> Result<(), Error> {
        let _tool = tool;
        unimplemented!();
    }
    
    // 停止MCP服务器
    async fn stop(&self) -> Result<(), Error> {
        unimplemented!();
    }
}