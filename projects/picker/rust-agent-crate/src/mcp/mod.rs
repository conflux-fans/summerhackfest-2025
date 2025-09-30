// MCP适配器实现模块定义
mod client;
mod adapter;
mod server;

// 重新导出模块内容
pub use client::{McpClient, SimpleMcpClient, McpTool};
pub use adapter::McpToolAdapter;
