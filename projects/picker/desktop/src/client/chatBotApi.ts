import { invoke } from '@tauri-apps/api/core';

// 定义TypeScript类型，与Rust中的结构体匹配
export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface McpTool {
  name: string;
  description: string;
}

export interface SessionInfo {
  session_id: string;
  has_agent: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  message_type: string;
}

/**
 * 初始化聊天机器人
 * @returns Promise<void>
 */
export async function initChatbot(): Promise<void> {
  try {
    await invoke('init_chatbot');
    console.log('Chatbot initialized successfully');
  } catch (error) {
    console.error('Chatbot initialization failed:', error);
    throw new Error(`Chatbot initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建新的聊天会话
 * @returns Promise<string> 返回会话ID
 */
export async function createChatSession(): Promise<string> {
  try {
    const sessionId = await invoke<string>('create_chat_session');
    console.log('Session created successfully. Session ID:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('Session creation failed:', error);
    throw new Error(`Session creation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 发送消息到聊天机器人
 * @param sessionId 会话ID
 * @param message 用户消息
 * @returns Promise<ChatResponse> 聊天响应
 */
export async function sendChatMessage(sessionId: string, message: string): Promise<ChatResponse> {
  try {
    const request: ChatRequest = {
      session_id: sessionId,
      message
    };
    
    const response = await invoke<ChatResponse>('send_chat_message', { request });
    console.log('Message sent successfully. Response:', response);
    return response;
  } catch (error) {
    console.error('Message sending failed:', error);
    throw new Error(`Message sending failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取可用的工具列表
 * @returns Promise<McpTool[]> 工具列表
 */
export async function getAvailableTools(): Promise<McpTool[]> {
  try {
    const toolsJson = await invoke<string>('get_available_tools');
    const tools = JSON.parse(toolsJson) as McpTool[];
    console.log('Available tools retrieved successfully. Tool count:', tools.length);
    return tools;
  } catch (error) {
    console.error('Failed to retrieve available tools:', error);
    throw new Error(`Failed to retrieve available tools: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 删除指定的聊天会话
 * @param sessionId 会话ID
 * @returns Promise<void>
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    await invoke('delete_chat_session', { sessionId });
    console.log('Session deleted successfully. Session ID:', sessionId);
  } catch (error) {
    console.error('Session deletion failed:', error);
    throw new Error(`Session deletion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 列出所有的聊天会话
 * @returns Promise<string[]> 会话ID列表
 */
export async function listChatSessions(): Promise<string[]> {
  try {
    const sessionsJson = await invoke<string>('list_chat_sessions');
    const sessions = JSON.parse(sessionsJson) as string[];
    console.log('Chat sessions retrieved successfully. Session count:', sessions.length);
    return sessions;
  } catch (error) {
    console.error('Failed to retrieve chat sessions:', error);
    throw new Error(`Failed to retrieve chat sessions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取指定会话的详情
 * @param sessionId 会话ID
 * @returns Promise<SessionInfo> 会话信息
 */
export async function getChatSession(sessionId: string): Promise<SessionInfo> {
  try {
    const sessionJson = await invoke<string>('get_chat_session', { sessionId });
    const session = JSON.parse(sessionJson) as SessionInfo;
    console.log('Chat session details retrieved successfully. Session ID:', sessionId);
    return session;
  } catch (error) {
    console.error('Failed to retrieve chat session details:', error);
    throw new Error(`Failed to retrieve chat session details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取指定会话的历史消息
 * @param sessionId 会话ID
 * @returns Promise<ChatMessage[]> 消息历史列表
 */
export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const historyJson = await invoke<string>('get_chat_history', { sessionId });
    const history = JSON.parse(historyJson) as ChatMessage[];
    console.log('Chat history retrieved successfully. Message count:', history.length);
    return history;
  } catch (error) {
    console.error('Failed to retrieve chat history:', error);
    throw new Error(`Failed to retrieve chat history: ${error instanceof Error ? error.message : String(error)}`);
  }
}