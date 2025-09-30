import './ProfileContent.css'
import type { Activity, InstalledTool, ResponseUserInfo } from '../types'
import { useState, useEffect } from 'react';
import { clientAPI } from '../client/api'

// interface ProfileContentProps {
//   // 可以添加从父组件传入的属性
// }

// 定义用户数据接口
interface UserProfile {
  chain_name: string,
  premium_free: number,
  premium_payment_rate: number,
  premium_toUsd: number,
  premium_period: number,
  premium_start: boolean,
  wallet_balance: number,
  premium_balance: number,
  name: string;
  role: string;
  ai_api_url: string;
  ai_api_key: string;
  bio: string;
  location: string;
  email: string;
  member_since: string;
  position: string;
  wallet_address: string;
  skills: string[];
}

const ProfileContent = () => {
    // 模拟用户数据
    const [userData, setUserData] = useState<UserProfile>({
    chain_name: 'Ethereum',
    premium_free: 0,
    premium_payment_rate: 0,
    premium_toUsd: 0,
    premium_period: 0,
    premium_start: false,
    wallet_balance: 0,
    premium_balance: 0,
    name: 'Deporter',
    role: 'User',
    ai_api_url: 'https://api.openai.com/v1/chat/completions',
    ai_api_key: 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXX',
    email: 'OpenPickLabs@hotmail.com',
    member_since: '2025.01',
    bio: 'Full-stack developer with expertise in cloud architecture and DevOps',
    location: 'China, ShangHai',
    position: 'Senior Developer',
    wallet_address: "123",
    skills: ['Rust', 'C/C++', 'Go', 'React', 'Node.js', 'Python', 'AI Agent', 'Blockchain/Web3', 'Smart System', 'Operator System', 'AWS', 'Docker', 'CI/CD', 'Hackathon Winner', 'Independent Developer', 'Fullstack Developer']
  });
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>({...userData});
  
  // 从后端获取用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 调用Tauri后端的get_current_user_info命令
        const response: ResponseUserInfo = await clientAPI.getCurrentUserInfo();
        
        if (response) {
          // 更新用户数据，将后端数据覆盖到模拟数据上
          setUserData(prev => ({
            ...prev,
            chain_name: response.chain_name || prev.chain_name,
            premium_free: response.premium_free || prev.premium_free,
            premium_payment_rate: response.premium_payment_rate || prev.premium_payment_rate,
            premium_toUsd: response.premium_toUsd || prev.premium_toUsd,
            premium_period: response.premium_period || prev.premium_period,
            premium_start: response.premium_start || prev.premium_start,
            wallet_balance: response.wallet_balance || prev.wallet_balance,
            premium_balance: response.user_info.premium_balance || prev.premium_balance,
            name: response.user_info.user_name || prev.name,
            email: response.user_info.email || prev.email,
            role: response.user_info.user_type == 'gen' ? 'User' : 'Developer',
            member_since: response.user_info.created_at ? new Date(response.user_info.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }) : prev.member_since,
            wallet_address: response.user_info.wallet_address || prev.wallet_address,
          }));
          setEditData(prev => ({
            ...prev,
            // bio: 'Full-stack developer with expertise in cloud architecture and DevOps',
            // location: 'China, ShangHai',
            // position: 'Senior Developer',
            // wallet_address: "123",
            // skills: ['Rust', 'C/C++', 'Go', 'React', 'Node.js', 'Python', 'AI Agent', 'Blockchain/Web3', 'Smart System', 'Operator System', 'AWS', 'Docker', 'CI/CD', 'Hackathon Winner', 'Independent Developer', 'Fullstack Developer']
            // name: response.user_info.user_name || prev.name,
            // email: response.user_info.email || prev.email,
            // role: response.user_info.user_type === 'gen' ? 'User' : 'Developer',
            // member_since: response.user_info.created_at ? new Date(response.user_info.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }) : prev.member_since,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // 继续使用模拟数据
      }
    };
    
    fetchUserData();
  }, []);

  // 模拟最近活动数据
  const [recentActivities, ] = useState<Activity[]>([
    {
      id: '1',
      type: 'installation',
      title: 'Installed Server Monitoring',
      description: 'Tool Server Monitoring',
      timestamp: '2024-05-01 01:32 AM'
    },
    {
      id: '2',
      type: 'purchase',
      title: 'Purchased Premium Plan',
      description: 'Subscription',
      timestamp: '2024-04-28 2:45 PM'
    },
    {
      id: '3',
      type: 'usage',
      title: 'Used API Integration Helper',
      description: 'Tool',
      timestamp: '2024-04-27 11:20 AM'
    },
    {
      id: '4',
      type: 'contribution',
      title: 'Submitted feedback for Data Processing Tool',
      description: 'Community',
      timestamp: '2024-04-25 4:12 PM'
    }
  ]);

  // 模拟已安装工具数据
  const [installedTools, ] = useState<InstalledTool[]>([
    {
      id: '1',
      name: 'Server Monitoring',
      type: 'performance',
      installedDate: '2024-04-01'
    },
    {
      id: '2',
      name: 'Backup System Plugin',
      type: 'security',
      installedDate: '2024-04-22'
    }
  ]);
  
  // 处理设置按钮点击，进入编辑模式
  const handleSettingsClick = () => {
    setEditData({...userData});
    setIsEditing(true);
  };
  
  // 处理输入变化
  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 处理技能标签变化
  const handleSkillsChange = (skill: string, checked: boolean) => {
    if (checked) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      }));
    }
  };
  
  // 添加新技能
  const handleAddSkill = (skill: string) => {
    if (skill && !editData.skills.includes(skill)) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };
  
  // 保存编辑
  const handleSaveEdit = () => {
    setUserData(editData);
    setIsEditing(false);
    // 这里可以添加保存到后端的逻辑
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({...userData});
  };

  // 获取活动类型对应的图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'installation': return '🖥️'
      case 'purchase': return '💰'
      case 'usage': return '🔧'
      case 'contribution': return '📝'
      default: return '•'
    }
  }

  // 获取工具类型对应的图标
  const getToolTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '⚡'
      case 'security': return '🛡️'
      default: return '🔧'
    }
  }

  return (
      <div className="profile-content">
        {/* 个人信息卡片 */}
        <div className="profile-card">
          <div className="profile-avatar">{userData.name.slice(0, 1)}</div>
          <h2 className="profile-name">{userData.name}</h2>
          <span className="profile-role">{userData.role}</span>
          <p className="profile-bio">{userData.bio}</p>
          
          <div className="personal-info">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">{userData.location}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✉️</span>
              <span className="info-text">{userData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📅</span>
              <span className="info-text">Member since {userData.member_since}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">💼</span>
              <span className="info-text">{userData.position}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🏢</span>
              <span className="info-text">{userData.wallet_address}</span>
            </div>
          </div>

          <div className="skills-section">
            <h3 className="section-subtitle">Expertise & Skills</h3>
            <div className="skills-tags">
              {userData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          <div className="profile-actions">
            <button className="generate-profile-btn">
              <span className="btn-icon">✏️</span>
              Generate Profile For My Friends
            </button>
            <button className="settings-btn" onClick={handleSettingsClick}>⚙️</button>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="profile-right">
          {/* 账户统计 */}
          <div className="account-stats">
            <div className="section-header">
              <h3 className="section-title">Account Statistics</h3>
              <button className="section-menu">⋮</button>
            </div>
            
            <div className="stats-wallet">
              <div className="wallet-item">
                <span className="wallet-label">Wallet Balance</span>
                <span className="wallet-value">{userData.wallet_balance ? (Math.round(userData.wallet_balance / 1e7) / 1e2) + ' ' + userData.chain_name.toUpperCase() : '0 ' + userData.chain_name.toUpperCase()}</span>
              </div>
              <div className="wallet-item">
                <span className="wallet-label">Premium Credits</span>
                <span className="wallet-value">{userData.premium_balance}</span>
              </div>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="recent-activity">
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
              <button className="section-menu">⋮</button>
            </div>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                  </div>
                  <div className="activity-time">{activity.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 已安装工具 */}
          <div className="installed-tools">
            <div className="section-header">
              <h3 className="section-title">Purchased Pickers</h3>
              <button className="section-menu">⋮</button>
            </div>
            <div className="tools-list">
              {installedTools.map(tool => (
                <div key={tool.id} className="tool-item">
                  <div className="tool-icon">{getToolTypeIcon(tool.type)}</div>
                  <div className="tool-info">
                    <div className="tool-name">{tool.name}</div>
                    <div className="tool-date">Installed on {tool.installedDate}</div>
                  </div>
                  <button className="tool-remove">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 编辑用户信息的模态框 */}
        {isEditing && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Settings</h2>
                <button className="close-btn" onClick={handleCancelEdit}>×</button>
              </div>
          <div className="modal-body">
            <div className="form-group">
              <label>AI-API-URL</label>
              <input 
                type="text" 
                value={editData.ai_api_url} 
                onChange={(e) => handleInputChange('ai_api_url', e.target.value)}
                // disabled={editData.ai_api_url !== userData.ai_api_url} // 如果是后端数据则不可编辑
              />
            {/* </div> */}
            {/* <div className="form-group"> */}
              <label>AI-API-Key</label>
              <input 
                type="text" 
                value={editData.ai_api_key} 
                onChange={(e) => handleInputChange('ai_api_key', e.target.value)}
                // disabled={editData.ai_api_key !== userData.ai_api_key} // 如果是后端数据则不可编辑
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea 
                value={editData.bio} 
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                value={editData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input 
                type="text" 
                value={editData.position} 
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Expertise</label>
              <div className="skills-editor">
                <div className="existing-skills">
                  {editData.skills.map((skill, index) => (
                    <div key={index} className="skill-edit-tag">
                      <span>{skill}</span>
                      <button 
                        className="remove-skill-btn" 
                        onClick={() => handleSkillsChange(skill, false)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-skill">
                  <input 
                    type="text" 
                    placeholder="Add new skill"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
            <button className="save-btn" onClick={handleSaveEdit}>Save Changes</button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProfileContent