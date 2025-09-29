import type { Task } from '../types'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
}

const TaskCard = ({ task }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#10b981' // green
      case 'idle':
        return '#3b82f6' // blue
      case 'error':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '●'
      case 'idle':
        return '●'
      case 'error':
        return '●'
      default:
        return '●'
    }
  }

  const formatDate = (dateStr: string) => {
    // 简单的日期格式化，实际项目中可能需要更复杂的处理
    return dateStr
  }

  return (
    <div className="task-card" data-status={task.status}>
      <div className="task-header">
        <h3 className="task-name">{task.name}</h3>
        <button className="task-menu" title="More options">
          ⋮
        </button>
      </div>
      
      <div className="task-info">
        <div className="info-row">
          <span className="info-icon">📅</span>
          <span className="info-label">Installed:</span>
          <span className="info-value">{formatDate(task.installed)}</span>
        </div>
        
        <div className="info-row">
          <span className="info-icon">▶️</span>
          <span className="info-label">Runs:</span>
          <span className="info-value">{task.runs}</span>
        </div>
      </div>

      <div className="task-status">
        <div className="status-indicator">
          <span 
            className="status-dot"
            style={{ color: getStatusColor(task.status) }}
          >
            {getStatusIcon(task.status)}
          </span>
          <span className="status-text" style={{ color: getStatusColor(task.status) }}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        
        <div className="last-run">
          <span className="last-run-icon">🕒</span>
          <span className="last-run-label">Last:</span>
          <span className="last-run-value">{formatDate(task.last_run)}</span>
        </div>
      </div>
    </div>
  )
}

export default TaskCard