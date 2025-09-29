// 定义API响应的类型
export interface UserInfo {
  user_id: string
  email: string
  user_name: string
  user_type: string
  wallet_address: string
  premium_balance: number
  created_at: string
}

export interface ResponseUserInfo {
  chain_name: string,
  premium_free: number,
  premium_payment_rate: number,
  premium_toUsd: number,
  premium_period: number,
  premium_start: boolean,
  wallet_balance: number,
  user_info: UserInfo
}

export interface RegisterResponse {
  user_id: string
  message: string
}

export interface PickerInfo {
  picker_id: string
  dev_user_id: string
  alias: string
  description: string
  price: number
  image_path: string
  version: string
  download_count: number
  created_at: string
  updated_at: string
  status: string
}

export interface PickerListResponse {
  pickers: PickerInfo[]
  total: number
}

export interface CreateOrderResponse {
  token: string
  message: string
}

export interface PayType {
  Wallet: 'wallet'
  Premium: 'premium'
}

export interface OrderStatus {
  Pending: 'pending'
  Success: 'success'
  Expired: 'expired'
}

export interface OrderInfo {
  orderId: string
  userId: string
  pickerId: string
  pickerAlias: string
  amount: number
  payType: PayType
  status: OrderStatus
  createdAt: string
}

export interface OrderListResponse {
  orders: OrderInfo[]
  total: number
  page: number
  size: number
  has_next: boolean
}

export interface Task {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error';
  installed: string;
  runs: number;
  last_run: string;
  picker_path: string;
}

export type TaskStatus = 'all' | 'running' | 'idle' | 'error';

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
}

// Marketplace interfaces
export interface PickerRating {
  score: number;
  count: number;
}

export interface Picker {
  id: string;
  name: string;
  description: string;
  category: string;
  developer: string;
  rating: PickerRating;
  installs: number;
  actionText: string;
  icon?: string;
}

export type Category = 'All' | 'Popular' | 'New';

// Profile interfaces
export interface Activity {
  id: string;
  type: 'installation' | 'purchase' | 'usage' | 'contribution';
  title: string;
  description: string;
  timestamp: string;
}

export interface InstalledTool {
  id: string;
  name: string;
  type: 'performance' | 'security';
  installedDate: string;
}

export interface ProfileStats {
  toolsUsed: number;
  contributions: number;
  tasksCompleted: number;
  monthsActive: number;
  storageUsed: number;
  storageTotal: number;
  walletBalance: number;
  premiumCredits: number;
}

// Chatbot interfaces
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?: 'text' | 'image' | 'button' | 'form';
  buttons?: ChatButton[];
}

export interface ChatButton {
  id: string;
  text: string;
  action: string;
}

export interface ChatbotSession {
  id: string;
  title: string;
  createdAt: string;
  lastMessage?: string;
}