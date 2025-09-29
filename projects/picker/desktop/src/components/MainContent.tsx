import React, { useState, useEffect, useRef, useCallback } from 'react'
import './MainContent.css'
import './TaskCard.css'
import { taskAPI, type TaskConfig } from '../client/taskApi'
import { open } from '@tauri-apps/plugin-dialog'

const MainContent: React.FC = () => {
  const [tasks, setTasks] = useState<TaskConfig[]>([])
  const [activeFilter, setActiveFilter] = useState<'All' | 'Running' | 'Idle' | 'Error'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [operatingTaskId, setOperatingTaskId] = useState<string | null>(null)

  // 创建任务模态框状态
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 简化的状态管理
  const fetchTimeoutRef = useRef<number | null>(null);

  // 简化的获取任务列表函数
  const fetchTasks = useCallback(async (force: boolean = false) => {
    // 简单的重复请求保护
    if (!force && isLoading) {
      return;
    }

    console.log('Fetching tasks, force:', force);
    setIsLoading(true);
    try {
      const taskList = await taskAPI.listTasks();
      console.log('Tasks fetched:', taskList.length);
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      if (force) {
        alert('Failed to load tasks. ' + (error instanceof Error ? error.message : 'Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 状态监听器
  const statusListenerRef = useRef<((tasks: TaskConfig[]) => void) | null>(null);

  // 初始化和清理
  useEffect(() => {
    // 创建状态监听器
    statusListenerRef.current = (updatedTasks: TaskConfig[]) => {
      console.log('MainContent: Received task status update:', updatedTasks.length, 'tasks');
      setTasks(updatedTasks);
      setOperatingTaskId(null); // 清除操作状态
    };

    // 注册监听器并初始加载
    const initializeComponent = async () => {
      try {
        console.log('Initializing MainContent component...');
        await taskAPI.addStatusListener(statusListenerRef.current!);
        console.log('Status listener registered successfully');
        // 移除这行代码，避免重复请求
        // await fetchTasks(true); // 强制初始加载
        console.log('Initial tasks should be loaded via status listener');
      } catch (error) {
        console.error('Failed to initialize component:', error);
      }
    };

    initializeComponent();

    // 清理函数
    return () => {
      if (statusListenerRef.current) {
        taskAPI.removeStatusListener(statusListenerRef.current);
      }
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchTasks]);

  // 任务操作处理函数（增强版）
  const handleRunTask = async (taskId: string) => {
    if (operatingTaskId) return; // 防止重复操作

    setOperatingTaskId(taskId);
    try {
      await taskAPI.runTask(taskId);
      // 状态更新由轮询和事件监听器处理
      // 但是为了更快的反馈，我们也可以手动刷新一次
      setTimeout(() => {
        setOperatingTaskId(current => current === taskId ? null : current);
      }, 2000); // 2秒后清除操作状态
    } catch (error) {
      console.error('Failed to run task:', error);
      alert('Failed to run task. ' + (error instanceof Error ? error.message : 'Please try again.'));
      setOperatingTaskId(null);
    }
  };

  const handleStopTask = async (taskId: string) => {
    if (operatingTaskId) return; // 防止重复操作

    setOperatingTaskId(taskId);
    try {
      await taskAPI.stopTask(taskId);
      // 状态更新由轮询和事件监听器处理
      setTimeout(() => {
        setOperatingTaskId(current => current === taskId ? null : current);
      }, 2000); // 2秒后清除操作状态
    } catch (error) {
      console.error('Failed to stop task:', error);
      alert('Failed to stop task. ' + (error instanceof Error ? error.message : 'Please try again.'));
      setOperatingTaskId(null);
    }
  };

  // 过滤和排序任务
  const filteredTasks = tasks
    .filter(task => {
      const matchesFilter = activeFilter === 'All' || task.status === activeFilter
      const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      // 按安装日期排序，最新安装的排在前面
      const installedA = a.installed || '0'
      const installedB = b.installed || '0'
      return installedB.localeCompare(installedA) // 降序排列，最新的在前
    })

  // 打开创建任务模态框
  const handleOpenCreateTaskModal = () => {
    setTaskName('');
    setSelectedFilePath('');
    setUploadProgress(0);
    setShowCreateTaskModal(true);
  };

  // 选择压缩文件
  const handleSelectFile = async () => {
    try {
      const fileDialogResult = await open({
        title: 'Select a Compressed File',
        multiple: false,
        directory: false,
        filters: [
          { name: 'Compressed Files', extensions: ['zip'] },
          // { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (fileDialogResult) {
        const filePath = Array.isArray(fileDialogResult) ? fileDialogResult[0] : fileDialogResult;
        setSelectedFilePath(filePath);
        // 自动从文件名提取任务名（去掉扩展名）
        const fileName = filePath.split(/[\\/]/).pop() || '';
        const taskNameFromFile = fileName.replace(/\.[^/.]+$/, '');
        setTaskName(taskNameFromFile);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      alert('Failed to select file. Please try again.');
    }
  };

  // 创建新任务
  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      alert('Please enter a task name.');
      return;
    }

    if (!selectedFilePath) {
      alert('Please select a compressed file.');
      return;
    }

    try {
      setUploadProgress(0);

      // 调用后端创建任务，将选择的文件路径直接传递给后端
      await taskAPI.createTask(taskName, selectedFilePath);

      setUploadProgress(100);

      // 关闭模态框并刷新任务列表
      setShowCreateTaskModal(false);
      await fetchTasks(true); // 强制刷新

      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. ' + (error instanceof Error ? error.message : 'Please try again.'));
      setUploadProgress(0);
    }
  };

  // 获取状态颜色（修复大小写匹配问题）
  const getStatusColor = (status?: string): string => {
    if (!status) return '#6b7280';
    switch (status.toLowerCase()) {
      case 'running': return '#10b981'
      case 'idle': return '#3b82f6'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="main-content-wrapper">
      <div className="content-header">
        <div className="header-controls">
          <div className="filter-tabs">
            {(['All', 'Running', 'Idle', 'Error'] as const).map(filter => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          {/* 添加刷新按钮 */}
          <button
            className="refresh-button"
            onClick={() => fetchTasks(true)}
            disabled={isLoading}
            title="Refresh tasks"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? '⟳' : '↻'}
          </button>
        </div>
      </div>

      <div className="task-grid">
        {filteredTasks.map(task => (
          <div key={task.id} className="task-card" data-status={task.status}>
            <div className="task-header">
              <h3 className="task-name">{task.name}</h3>
              <button className="task-menu">⋮</button>
            </div>

            <div className="task-info">
              <div className="info-row">
                <span className="info-icon">🪪</span>
                <span className="info-label">TaskID:</span>
                <span className="info-value">{task.id || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-icon">📅</span>
                <span className="info-label">Installed:</span>
                <span className="info-value">{task.installed || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-icon">▶️</span>
                <span className="info-label">Runs:</span>
                <span className="info-value">{task.runs || 0}</span>
              </div>
            </div>

            <div className="task-status">
              <div className="status-indicator">
                <span
                  className="status-dot"
                  style={{ color: getStatusColor(task.status) }}
                >
                  ●
                </span>
                <span className="status-text" style={{ color: getStatusColor(task.status) }}>
                  {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'N/A'}
                </span>
              </div>
              <div className="last-run">
                <span className="last-run-icon">🕒</span>
                <span className="last-run-label">Last:</span>
                <span className="last-run-value">{task.last_run || 'Never'}</span>
              </div>
            </div>

            {/* 任务操作按钮 */}
            <div className="task-actions">
              {task.status === 'Running' ? (
                <button
                  className="action-button stop-button"
                  onClick={() => handleStopTask(task.id)}
                  disabled={operatingTaskId === task.id}
                >
                  {operatingTaskId === task.id ? 'Stopping...' : 'Stop'}
                </button>
              ) : (
                <button
                  className="action-button run-button"
                  onClick={() => handleRunTask(task.id)}
                  disabled={operatingTaskId === task.id}
                >
                  {operatingTaskId === task.id ? 'Starting...' : 'Run'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-button"
        onClick={handleOpenCreateTaskModal}
      >
        <span className="add-icon">+</span>
      </button>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="modal-overlay" onClick={() => setShowCreateTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowCreateTaskModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="task-name">Task Name</label>
                <input
                  type="text"
                  id="task-name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div className="form-group">
                <label>Select Compressed File</label>
                <button
                  className="modal-button secondary file-select-btn"
                  onClick={handleSelectFile}
                  style={{ marginBottom: '10px' }}
                >
                  Browse Files
                </button>
                {selectedFilePath && (
                  <div className="selected-file-path">
                    Selected: {selectedFilePath.split(/[\\/]/).pop()}
                  </div>
                )}
              </div>
              {uploadProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-button secondary"
                onClick={() => setShowCreateTaskModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button primary"
                onClick={handleCreateTask}
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                {uploadProgress > 0 && uploadProgress < 100 ? 'Processing...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainContent