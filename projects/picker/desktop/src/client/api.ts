// API Service
// 提供与 Tauri 后端通信的接口
import { invoke } from '@tauri-apps/api/core';
import type { ResponseUserInfo, RegisterResponse, UserInfo, PickerListResponse, CreateOrderResponse, OrderStatus, OrderListResponse, OrderInfo } from '../types';
// import type { message } from '@tauri-apps/plugin-dialog';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户数据库
const localUsers = [
  {
    id: '1',
    email: 'user@example.com',
    userName: 'TestUser',
    userPassword: 'password123', // 在实际应用中应使用加密存储
    avatar: 'TU',
    wallet: 100,
    premium: 1,
    verified: true
  },
  {
    id: '2',
    email: 'admin@example.com',
    userName: 'Admin',
    userPassword: 'admin123',
    avatar: 'AD',
    wallet: 500,
    premium: 2,
    verified: true
  }
]



// 模拟产品数据库
const localPickersDatabase = [
  {
    id: '1',
    name: 'Data Processing Tool',
    description: 'ETL tool. Transform, validate and load data with ease.',
    category: 'Tools' as const,
    developer: 'DataTeam Inc.',
    rating: { score: 4.5, count: 128 },
    installs: 3450,
    actionText: 'Get'
  },
  {
    id: '2',
    name: 'Server Monitoring',
    description: 'Real-time server monitoring with alerts and detailed performance metrics.',
    category: 'Popular' as const,
    developer: 'ServerPro Systems',
    rating: { score: 4.8, count: 312 },
    installs: 8250,
    actionText: 'Get'
  },
  {
    id: '3',
    name: 'API Integration Helper',
    description: 'Simplify API integrations with built-in connectors and templates for popular services.',
    category: 'Tools' as const,
    developer: 'DevToolkit Labs',
    rating: { score: 4.2, count: 89 },
    installs: 1875,
    actionText: 'Get'
  },
  {
    id: '4',
    name: 'Backup System Plugin',
    description: 'Automated backup solution with encryption, versioning, and easy restore functionality.',
    category: 'New' as const,
    developer: 'SecureData Systems',
    rating: { score: 4.7, count: 56 },
    installs: 2140,
    actionText: 'Get'
  },
  {
    id: '5',
    name: 'File Conversion Service',
    description: 'Convert between document formats with high-quality output and batch processing capabilities.',
    category: 'Tools' as const,
    developer: 'FileTools Inc.',

    rating: { score: 4.3, count: 147 },
    installs: 4320,
    actionText: 'Get'
  },
  {
    id: '6',
    name: 'AI Assistant Worker',
    description: 'AI-powered assistant for task automation, data analysis and intelligent recommendations.',
    category: 'Premium' as const,
    developer: 'Alnova Tech',
    rating: { score: 4.6, count: 203 },
    installs: 6790,
    actionText: 'Get'
  }
]

// 模拟用户活动数据库
type UserActivities = Array<{
  id: string;
  type: 'installation' | 'purchase' | 'usage' | 'contribution';
  title: string;
  description: string;
  timestamp: string;
}>;

const localActivitiesDatabase: Record<string, UserActivities> = {
  '1': [
    {
      id: '1',
      type: 'installation' as const,
      title: 'Installed Server Monitoring',
      description: 'Tool Server Monitoring',
      timestamp: '2024-05-01 01:32 AM'
    },
    {
      id: '2',
      type: 'purchase' as const,
      title: 'Purchased Premium Plan',
      description: 'Subscription',
      timestamp: '2024-04-28 2:45 PM'
    },
    {
      id: '3',
      type: 'usage' as const,
      title: 'Used API Integration Helper',
      description: 'Tool',
      timestamp: '2024-04-27 11:20 AM'
    },
    {
      id: '4',
      type: 'contribution' as const,
      title: 'Submitted feedback for Data Processing Tool',
      description: 'Community',
      timestamp: '2024-04-25 4:12 PM'
    }
  ],
  '2': [
    {
      id: '5',
      type: 'installation' as const,
      title: 'Installed Admin Dashboard',
      description: 'Admin Tool',
      timestamp: '2024-04-30 10:15 AM'
    },
    {
      id: '6',
      type: 'usage' as const,
      title: 'Generated System Report',
      description: 'Admin Function',
      timestamp: '2024-04-29 3:30 PM'
    }
  ]
}

// 模拟已安装工具数据库
type InstalledTools = Array<{
  id: string;
  name: string;
  type: 'performance' | 'security' | 'administration';
  installedDate: string;
}>;

const localInstalledToolsDatabase: Record<string, InstalledTools> = {
  '1': [
    {
      id: '1',
      name: 'Server Monitoring',
      type: 'performance' as const,
      installedDate: '2024-04-01'
    },
    {
      id: '2',
      name: 'Backup System Plugin',
      type: 'security' as const,
      installedDate: '2024-04-22'
    }
  ],
  '2': [
    {
      id: '3',
      name: 'Admin Dashboard',
      type: 'administration' as const,
      installedDate: '2024-03-15'
    }
  ]
}

// // 模拟验证码存储
// const verificationCodes: Record<string, string> = {}

// // 生成随机验证码
// const generateVerificationCode = (): string => {
//   return Math.floor(100000 + Math.random() * 900000).toString()
// }

// API 服务类
class APIService {
  // 用户认证相关接口, 登录, 注册, 注销, 验证 Done
  async login(email: string, userPassword: string): Promise<ResponseUserInfo> {
    await delay(200)
    try {
      // 调用 Tauri 后端的 login 命令
      const responseUserInfo = await invoke<ResponseUserInfo>('login', {
        email, // 假设的测试邮箱
        userPassword // 假设的测试密码
      });

      if (!responseUserInfo) {
        throw new Error('User not found.')
      }

      return responseUserInfo;

    } catch (error) {
      // throw new Error(error instanceof Error ? error.message : 'Please try again.');
      const errorMessage = error instanceof Error ? 
        (error.message || 'Login failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<unknown> {
    try {
      // 调用 Tauri 后端的 logout 命令
      const message = await invoke('logout');
      
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Logout failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  // 检查登录状态
  async checkLoginStatus(): Promise<boolean> {
    try {
      // 调用 Tauri 后端的 check_login_status 命令
      const isLoggedIn = await invoke<boolean>('check_login_status');
      return isLoggedIn;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Check login status failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }
  
  async register(email: string, userName: string, userPassword: string, userType: string): Promise<unknown> {
    await delay(200)

    try {
      // 调用 Tauri 后端的 register 命令
      const response = await invoke<RegisterResponse>('register', {
        email,
        userPassword,
        userName,
        userType
      });

      // // 转换响应格式以保持与原有接口兼容
      // const registerData = {
      //   user_id: response.user_id,
      //   message: response.message,
      // };
      
      return response.message;
    } catch (error) {
      // throw new Error(error instanceof Error ? error.message : 'Please try again.');
      const errorMessage = error instanceof Error ? 
        (error.message || 'Registration failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }
  
  async verifyEmail(email: string, code: string): Promise<unknown> {
    await delay(700)

    try {
      // 调用 Tauri 后端的 verify_email 命令
      await invoke('verify_email', {
        email,
        code
      });
      
      return 'Email verified successfully!';
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Email verification failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  // 用户资料相关接口
  async getUserProfile(): Promise<unknown> {
    await delay(700)

    try {
      // 调用 Tauri 后端的 get_user_profile 命令
      const response = await invoke<UserInfo>('get_user_profile');

      if (!response) {
        throw new Error('User not found')
      }

      // 转换响应格式以保持与原有接口兼容
      const userData = {
        id: response.user_id,
        email: response.email,
        user_name: response.user_name,
        avatar: response.user_name.substring(0, 2).toUpperCase(),
        wallet_address: response.wallet_address,
        premium_balance: response.premium_balance,
        created_at: response.created_at
      };
      
      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Get user profile failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async getCurrentUserInfo(): Promise<ResponseUserInfo> {
    await delay(700)

    try {
      // 调用 Tauri 后端的 get_current_user_info 命令
      const responseUserInfo = await invoke<ResponseUserInfo>('get_current_user_info');

      if (!responseUserInfo) {
        throw new Error('User not found')
      }

      return responseUserInfo
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Get current user info failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }
  
  async getUserActivities(userId: string): Promise<unknown> {
    await delay(600)
    
    const activities = localActivitiesDatabase[userId] || []
    
    return { activities }
  }
  
  async getInstalledTools(userId: string): Promise<unknown> {
    await delay(500)
    
    const tools = localInstalledToolsDatabase[userId] || []
    
    return { tools }
  }
  
  async getProfileStats(userId: string): Promise<unknown> {
    await delay(400)
    
    // 计算用户的统计数据
    const toolsUsed = (localInstalledToolsDatabase[userId] || []).length
    
    return {
      stats: {
        toolsUsed,
        contributions: 0, // 简化示例
        tasksCompleted: 0, // 简化示例
        monthsActive: 8,
        storageUsed: 1.2,
        storageTotal: 5,
        walletBalance: localUsers.find(u => u.id === userId)?.wallet || 0,
        premiumCredits: localUsers.find(u => u.id === userId)?.premium || 0
      }
    }
  }

  // Home 相关的接口
  async getLocalPickers(category?: string, search?: string): Promise<unknown> {
    await delay(600)
    
    let filteredLocalPickers = [...localPickersDatabase]
    
    // 按分类筛选
    if (category && category !== 'All') {
      filteredLocalPickers = filteredLocalPickers.filter(p => p.category === category)
    }
    
    // 按搜索关键词筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLocalPickers = filteredLocalPickers.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      )
    }
    
    return { 
      pickers: filteredLocalPickers,
      total: filteredLocalPickers.length,
      categories: ['All', ...Array.from(new Set(localPickersDatabase.map(p => p.category)))]
    }
  }
  
  async getLocalPickerDetails(pickerId: string): Promise<unknown> {
    await delay(400)
    
    const picker = localPickersDatabase.find(p => p.id === pickerId)
    
    if (!picker) {
      throw new Error('Picker not found')
    }
    
    return picker;
  }



  // 上传本地 Picker，仅 Dev权限
  async uploadLocalPicker(alias: string, description: string, version: string, price: number, file: File, image?: File): Promise<unknown> {
    await delay(800)

    try {
      // 调用 Tauri 后端的 upload_picker 命令
      await invoke<string>('upload_picker', {
        alias,
        description,
        version,
        price,
        file: await file.arrayBuffer(),
        image: image ? await image.arrayBuffer() : undefined,
      });

      return 'Upload Picker success.';
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Upload Picker failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  // 市场 Pickers 相关接口
  async getPickerMarketplace(page?: string, size?: string, keyword?: string): Promise<PickerListResponse> {
    await delay(500)
    
    try {
      // 调用 Tauri 后端的 get_picker_marketplace 命令
      const pickerListResponse = await invoke<PickerListResponse>('get_picker_marketplace', {
        page,
        size,
        keyword,
      });

      if (!pickerListResponse) {
        throw new Error('Picker list not found')
      }

      return pickerListResponse
    } catch (error) {
      // throw new Error(error instanceof Error ? error.message : 'Please try again.');
      const errorMessage = error instanceof Error ? 
        (error.message || 'Get Picker Marketplace failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async getPickerDetails(pickerId: string): Promise<unknown> {
    await delay(500)
    
    try {
      // 调用 Tauri 后端的 get_picker_detail 命令
      const response = await invoke<string>('get_picker_detail', {
        pickerId,
      });

      if (!response) {
        throw new Error('Picker not found')
      }

      return response
    } catch (error) {
      // throw new Error(error instanceof Error ? error.message : 'Please try again.');
      const errorMessage = error instanceof Error ? 
        (error.message || 'Get Picker Detail failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  // Picker 订单相关的接口
  async createOrder(pickerid: string, paytype: string): Promise<string> {
    await delay(800)

    try {
      // 调用 Tauri 后端的 create_order 命令
      const createOrderResponse = await invoke<CreateOrderResponse>('create_order', {
        pickerId: pickerid,
        payType: paytype,
      });

      if (!createOrderResponse || !createOrderResponse.token) {
        throw new Error('Create Order failed.')
      }
      // "Order created successfully, Never close the client and wait for execution to complete!"
      return createOrderResponse.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Create Order failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async getUserOrders(page?: number, size?: number, status?: OrderStatus): Promise<unknown> {
    await delay(500)
    
    try {
      // 调用 Tauri 后端的 get_user_orders 命令
      const userOrderList = await invoke<OrderListResponse>('get_user_orders', {
        page,
        size,
        status,
      });

      if (!userOrderList) {
        throw new Error('Get User Order failed.')
      }

      return userOrderList;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Create Order List failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async getOrderDetails(orderId: string): Promise<unknown> {
    await delay(500)
    
    try {
      // 调用 Tauri 后端的 get_order_detail 命令
      const orderDetail = await invoke<OrderInfo>('get_order_detail', {
        order_id: orderId,
      });

      if (!orderDetail) {
        throw new Error('Get User Order Detail failed.')
      }

      return orderDetail;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Get Order Detail failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }

  async downloadFile(token: string): Promise<string> {
    await delay(100)
    try {
      // 调用 Tauri 后端的 download_picker 命令
      const fileLocalPath = await invoke<string>('download_picker', {
        token: token,
      });

      if (!fileLocalPath) {
        throw new Error('Download Picker failed.')
      }

      return fileLocalPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        (error.message || 'Download Picker failed.') : 
        (typeof error === 'string' ? error : JSON.stringify(error) || 'Please try again.');
      throw new Error(errorMessage);
    }
  }
  
//   // 聊天机器人相关接口
//   async sendChatMessage(_sessionId: string, message: string): Promise<unknown> {
//     await delay(1500) // 模拟AI响应时间
    
//     // 简单的响应逻辑，根据用户输入生成不同的回复
//     let botResponse = ''
//     let responseButtons = []
    
//     if (message.toLowerCase().includes('help')) {
//       botResponse = 'I can help you with various tasks. What specific issue are you facing?'
//       responseButtons = [
//         { id: 'task_help', text: 'Task troubleshooting', action: 'task_troubleshoot' },
//         { id: 'tool_help', text: 'Tool installation', action: 'tool_install' },
//         { id: 'account_help', text: 'Account issues', action: 'account_issues' }
//       ]
//     } else if (message.toLowerCase().includes('tools')) {
//       botResponse = 'We have various tools available in the marketplace. Here are some popular ones:'
//       responseButtons = [
//         { id: 'data_tool', text: 'Data Processing Tool', action: 'tool_data' },
//         { id: 'monitor_tool', text: 'Server Monitoring', action: 'tool_monitor' },
//         { id: 'backup_tool', text: 'Backup System Plugin', action: 'tool_backup' }
//       ]
//     } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
//       botResponse = 'Hello! How can I assist you today?'
//       responseButtons = [
//         { id: 'feature_req', text: 'Request a feature', action: 'feature_req' },
//         { id: 'feedback', text: 'Provide feedback', action: 'feedback' }
//       ]
//     } else if (message.toLowerCase().includes('task') || message.toLowerCase().includes('pipeline')) {
//       botResponse = 'I can help you create, manage, or troubleshoot tasks. What do you need help with specifically?'
//       responseButtons = [
//         { id: 'create_task', text: 'Create a new task', action: 'create_task' },
//         { id: 'task_error', text: 'Fix task error', action: 'task_error' },
//         { id: 'task_optimize', text: 'Optimize task', action: 'task_optimize' }
//       ]
//     } else {
//       botResponse = `Thank you for your message: "${message}". I'm here to help you with any questions or issues you might have.`
//       responseButtons = [
//         { id: 'more_help', text: 'More assistance', action: 'more_help' },
//         { id: 'contact_support', text: 'Contact support', action: 'contact_support' }
//       ]
//     }
    
//     return {
//       success: true,
//       message: {
//         id: Date.now().toString(),
//         content: botResponse,
//         sender: 'bot',
//         timestamp: new Date().toISOString(),
//         type: 'text' as const,
//         buttons: responseButtons
//       }
//     }
//   }
  
  // 文件上传相关接口
  async uploadFile(file: File): Promise<unknown> {
    await delay(2000) // 模拟上传时间
    
    return {
      success: true,
      fileId: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      uploadTime: new Date().toISOString()
    }
  }


}

// 导出单例实例
export const clientAPI = new APIService()

export default clientAPI
