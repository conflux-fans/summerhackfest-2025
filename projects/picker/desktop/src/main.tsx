import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { getCurrentWindow } from '@tauri-apps/api/window'

// 清理Token的函数
const cleanupTokenOnClose = async () => {
  try {
    // 动态导入clientAPI，避免循环依赖
    const { clientAPI } = await import('./client/api')
    
    // 检查是否已登录
    const loggedIn = await clientAPI.checkLoginStatus()
    if (loggedIn) {
      // 静默调用logout清理Token
      console.log('Cleaning up token on window close...')
      await clientAPI.logout()
      console.log('Token cleanup completed')
    }
  } catch (error) {
    console.error('Failed to cleanup token on close:', error)
  }
}

// 获取当前窗口实例
const mainWindow = getCurrentWindow()

// 添加标志变量防止循环调用
let isClosing = false

// 添加窗口关闭事件监听
mainWindow.onCloseRequested(async (event) => {
 // 如果已经在关闭过程中，直接允许关闭
  if (isClosing) {
    return
  }

  // 阻止默认关闭行为
  event.preventDefault()
  
  // 设置标志表示正在关闭
  isClosing = true

  try {
    // 执行清理Token的操作
    await cleanupTokenOnClose()
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    // 完成后关闭窗口
    mainWindow.close()
  }
  

})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
