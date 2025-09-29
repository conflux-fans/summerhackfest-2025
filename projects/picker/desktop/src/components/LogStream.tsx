import { useState, useRef, useEffect } from 'react'
import './LogStream.css'
import { taskAPI, type TaskLog } from '../client/taskApi'

interface LogEntry {
  id: string
  message: string
  type: 'error' | 'warning' | 'info'
  timestamp: number
  taskId: string
}

const LogStream = () => {
  // 动态日志数据
  const [logs, setLogs] = useState<LogEntry[]>([])
  
  // 存储每个任务的最新日志条目ID，用于防止重复
  // const latestLogIdsRef = useRef<Map<string, number>>(new Map())

  // 筛选状态
  const [filters, setFilters] = useState({
    error: true,
    warning: true,
    info: true,
  })

  // 面板状态
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [height, setHeight] = useState('200px')
  const [resizing, setResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // 添加日志的方法
  const addLog = (taskLog: TaskLog) => {
    setLogs(prev => {
      // 限制日志数量，避免内存占用过大
      const MAX_LOGS = 500
      const newLogs = [...prev]
      
      // 创建新的日志条目
      const logEntry: LogEntry = {
        id: `${taskLog.task_id}-${taskLog.timestamp}`,
        message: taskLog.message,
        type: taskLog.type, // 直接使用原始类型，不再做错误的映射
        timestamp: taskLog.timestamp,
        taskId: taskLog.task_id
      }
      
      // 添加到日志数组开头
      newLogs.unshift(logEntry)
      
      // 如果超过最大日志数量，移除最旧的日志
      if (newLogs.length > MAX_LOGS) {
        newLogs.splice(MAX_LOGS)
      }
      
      return newLogs
    })
  }

  // 监听日志事件
  useEffect(() => {
    const logListener = async () => {
      try {
        // 注册全局日志监听器，接收所有任务的日志
        await taskAPI.addLogListener('global', (log) => {
          addLog(log)
        })
        
        console.log('Log listener initialized')
      } catch (error) {
        console.error('Failed to initialize log listener:', error)
      }
    }
    
    logListener()
    
    // 组件卸载时清理监听器
    return () => {
      taskAPI.removeLogListener('global')
    }
  }, [])

  // 筛选后的日志
  const filteredLogs = logs.filter(log => {
    if (log.type === 'error') return filters.error
    if (log.type === 'warning') return filters.warning
    if (log.type === 'info') return filters.info
    return true
  })

  // 复制日志到剪贴板
  const copyLogs = () => {
    const logText = filteredLogs.map(log => `${log.type.toUpperCase()}: ${log.message}`).join('\n')
    navigator.clipboard.writeText(logText).then(() => {
      // 可以添加复制成功的提示
      console.log('Logs copied to clipboard')
    })
  }

  // 切换筛选器
  const toggleFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }

  // 切换面板显示/隐藏
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    setIsExpanded(false)
  }

  // 切换面板展开/正常
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    setHeight(isExpanded ? '200px' : '100vh')
  }

  // 处理拖拽调整大小
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setResizing(true)
  }

  const handleResize = (e: MouseEvent) => {
    if (!resizing || !panelRef.current || isMinimized || isExpanded) return
    
    const appHeight = document.documentElement.clientHeight
    const newHeight = Math.max(100, appHeight - e.clientY)
    setHeight(`${newHeight}px`)
  }

  const handleResizeEnd = () => {
    setResizing(false)
  }

  // 监听全局鼠标事件
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizing])

  return (
    <>
      {isMinimized ? (
        // 最小化状态 - 底部栏
        <div className="log-stream-minimized" onClick={toggleMinimize}>
          <span className="log-stream-label">Log Stream</span>
        </div>
      ) : (
        // 展开状态
        <div 
          ref={panelRef}
          className={`log-stream ${isExpanded ? 'log-stream-expanded' : ''}`}
          style={{ height }}
        >
          {/* 顶部控制栏 */}
          <div className="log-header">
            <div className="log-header-left">
              <span className="log-header-title">Log Stream</span>
            </div>
            
            {/* 筛选器按钮 */}
            <div className="log-filters">
              <div className="filter-dropdown">
                <button className="filter-button">
                  <span className="filter-icon">🔍</span>
                </button>
                <div className="filter-dropdown-content">
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.error} 
                      onChange={() => toggleFilter('error')}
                    />
                    ERROR
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.warning} 
                      onChange={() => toggleFilter('warning')}
                    />
                    WARN
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.info} 
                      onChange={() => toggleFilter('info')}
                    />
                    INFO
                  </label>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="log-actions">
              <button 
                className="log-action-button copy-button" 
                onClick={copyLogs}
                title="Copy"
              >
                <span className="action-icon">📋</span>
              </button>
              
              <button 
                className="log-action-button expand-button" 
                onClick={toggleExpand}
                title={isExpanded ? "Return To Normal" : "Full Screen"}
              >
                <span className="action-icon">{isExpanded ? '⬇️' : '⬆️'}</span>
                {/* {isExpanded ? 'Recovery' : 'Expand'} */}
              </button>
              
              <button 
                className="log-action-button close-button" 
                onClick={toggleMinimize}
                title="Close Panel"
              >
                <span className="action-icon">✕</span>
              </button>
            </div>
          </div>
          
          {/* 拖拽手柄 */}
          <div className="resize-handle" onMouseDown={handleResizeStart}>
            <div className="resize-indicator"></div>
          </div>
          
          {/* 日志内容区域 */}
              <div className="log-content">
                {filteredLogs.length === 0 ? (
                  <div className="log-empty">
                    {logs.length === 0 ? 
                      '等待任务运行，日志将显示在这里...' : 
                      '没有符合筛选条件的日志'
                    }
                  </div>
                ) : (
                  filteredLogs.map((entry) => {
                    // 格式化时间戳
                    const time = new Date(entry.timestamp).toLocaleTimeString()
                    
                    return (
                      <div key={entry.id} className={`log-entry ${entry.type}`}>
                        <span className="log-time">[{time}]</span>
                        <span className={`log-level ${entry.type}`}>
                          {entry.type.toUpperCase()}
                        </span>
                        {entry.taskId && (
                          <span className="log-task-id">
                            [Task: {entry.taskId.slice(0, 8)}...]
                          </span>
                        )}
                        <span className="log-prefix">&gt;</span>
                        <span className="log-message">{entry.message}</span>
                      </div>
                    )
                  })
                )}
              </div>
        </div>
      )}
    </>
  )
}

export default LogStream