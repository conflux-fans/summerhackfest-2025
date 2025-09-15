class UsernameService {
  constructor() {
    this.USERNAME_KEY = 'forum_username';
    this.USERNAME_HISTORY_KEY = 'forum_username_history';
  }

  // Get username for an address
  getUsername(address) {
    if (!address) return null;
    
    try {
      const usernames = this.getAllUsernames();
      return usernames[address.toLowerCase()] || null;
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  }

  // Set username for current user
  setUsername(address, username) {
    if (!address || !username) return false;
    
    try {
      const usernames = this.getAllUsernames();
      usernames[address.toLowerCase()] = username.trim();
      localStorage.setItem(this.USERNAME_KEY, JSON.stringify(usernames));
      
      // Add to history
      this.addToHistory(address, username);
      
      return true;
    } catch (error) {
      console.error('Error setting username:', error);
      return false;
    }
  }

  // Get all usernames
  getAllUsernames() {
    try {
      const stored = localStorage.getItem(this.USERNAME_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting all usernames:', error);
      return {};
    }
  }

  // Add username to history
  addToHistory(address, username) {
    try {
      const history = this.getUsernameHistory();
      const userHistory = history[address.toLowerCase()] || [];
      
      // Add new username if it's different from the last one
      if (userHistory.length === 0 || userHistory[userHistory.length - 1] !== username) {
        userHistory.push({
          username: username,
          timestamp: Date.now()
        });
        
        // Keep only last 10 usernames
        if (userHistory.length > 10) {
          userHistory.splice(0, userHistory.length - 10);
        }
        
        history[address.toLowerCase()] = userHistory;
        localStorage.setItem(this.USERNAME_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error adding to username history:', error);
    }
  }

  // Get username history for an address
  getUsernameHistory(address) {
    if (!address) return [];
    
    try {
      const history = this.getUsernameHistory();
      return history[address.toLowerCase()] || [];
    } catch (error) {
      console.error('Error getting username history:', error);
      return [];
    }
  }

  // Get all username history
  getUsernameHistory() {
    try {
      const stored = localStorage.getItem(this.USERNAME_HISTORY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting username history:', error);
      return {};
    }
  }

  // Check if username is available (not used by other addresses)
  isUsernameAvailable(username, currentAddress) {
    if (!username) return false;
    
    const usernames = this.getAllUsernames();
    const trimmedUsername = username.trim().toLowerCase();
    
    for (const [address, storedUsername] of Object.entries(usernames)) {
      if (address !== currentAddress?.toLowerCase() && 
          storedUsername?.toLowerCase() === trimmedUsername) {
        return false;
      }
    }
    
    return true;
  }

  // Validate username
  validateUsername(username) {
    if (!username) {
      return { valid: false, error: 'Username is required' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 2) {
      return { valid: false, error: 'Username must be at least 2 characters long' };
    }
    
    if (trimmed.length > 20) {
      return { valid: false, error: 'Username must be 20 characters or less' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    
    return { valid: true };
  }

  // Format address for display (with username if available)
  formatDisplayName(address, fallbackLength = 6) {
    if (!address) return '';
    
    const username = this.getUsername(address);
    if (username) {
      return `@${username}`;
    }
    
    return `${address.slice(0, fallbackLength)}...${address.slice(-4)}`;
  }

  // Get display name for posts/replies
  getDisplayName(address) {
    if (!address) return 'Unknown User';
    
    const username = this.getUsername(address);
    if (username) {
      return username;
    }
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Clear all usernames (for testing)
  clearAllUsernames() {
    try {
      localStorage.removeItem(this.USERNAME_KEY);
      localStorage.removeItem(this.USERNAME_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing usernames:', error);
      return false;
    }
  }

  // Get display name with moderator indicator
  getDisplayNameWithModerator(address, isModerator = false) {
    if (!address) return 'Unknown User';
    
    const username = this.getUsername(address);
    const displayName = username || `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    return {
      name: displayName,
      isModerator: isModerator
    };
  }

  // Create moderator indicator JSX
  createModeratorIndicator() {
    return (
      <span className="moderator-indicator" title="Moderator">
        🛡️
      </span>
    );
  }

  // Profile Picture Management
  setProfilePicture(address, imageData) {
    if (!address) return false;
    try {
      const key = `profile_picture_${address.toLowerCase()}`;
      localStorage.setItem(key, imageData);
      return true;
    } catch (error) {
      console.error('Error saving profile picture:', error);
      return false;
    }
  }

  getProfilePicture(address) {
    if (!address) return null;
    try {
      const key = `profile_picture_${address.toLowerCase()}`;
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting profile picture:', error);
      return null;
    }
  }

  removeProfilePicture(address) {
    if (!address) return false;
    try {
      const key = `profile_picture_${address.toLowerCase()}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing profile picture:', error);
      return false;
    }
  }

  // Get default avatar based on address
  getDefaultAvatar(address) {
    if (!address) return '👤';
    
    // Generate a consistent emoji based on address
    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const avatars = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🎨'];
    const avatarIndex = Math.abs(addressHash) % avatars.length;
    
    return avatars[avatarIndex];
  }
}

// Create singleton instance
const usernameService = new UsernameService();

export default usernameService;
