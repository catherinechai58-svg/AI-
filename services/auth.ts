
import { User } from '../types';

const STORAGE_KEY = 'deepanalyze_users';
const CURRENT_USER_KEY = 'deepanalyze_current_user';
const MAX_DAILY_REPORTS = 3;

// Helper to get today's date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

export const AuthService = {
  login: async (username: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retrieve users DB from local storage
    const usersRaw = localStorage.getItem(STORAGE_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    
    const today = getTodayString();
    let user = users[username];

    if (!user) {
      // Create new user if not exists
      user = {
        username,
        lastLogin: Date.now(),
        dailyUsageCount: 0,
        lastUsageDate: today
      };
    } else {
      // Update existing user
      user.lastLogin = Date.now();
      // Reset quota if it's a new day
      if (user.lastUsageDate !== today) {
        user.dailyUsageCount = 0;
        user.lastUsageDate = today;
      }
    }

    // Save back to storage
    users[username] = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (!userRaw) return null;
    
    const user = JSON.parse(userRaw);
    
    // Check if we need to reset daily quota upon retrieval
    const today = getTodayString();
    if (user.lastUsageDate !== today) {
      user.dailyUsageCount = 0;
      user.lastUsageDate = today;
      // Update storage
      AuthService.updateUser(user);
    }
    
    return user;
  },

  updateUser: (user: User) => {
    const usersRaw = localStorage.getItem(STORAGE_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    users[user.username] = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  canGenerateReport: (user: User): boolean => {
    const today = getTodayString();
    if (user.lastUsageDate !== today) return true; // New day, allow
    return user.dailyUsageCount < MAX_DAILY_REPORTS;
  },

  incrementUsage: (username: string): User => {
    const usersRaw = localStorage.getItem(STORAGE_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    const user = users[username];

    if (user) {
      const today = getTodayString();
      if (user.lastUsageDate !== today) {
        user.dailyUsageCount = 1;
        user.lastUsageDate = today;
      } else {
        user.dailyUsageCount += 1;
      }
      
      users[username] = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    throw new Error("User not found");
  },

  getRemainingCredits: (user: User): number => {
    const today = getTodayString();
    if (user.lastUsageDate !== today) return MAX_DAILY_REPORTS;
    return Math.max(0, MAX_DAILY_REPORTS - user.dailyUsageCount);
  }
};
