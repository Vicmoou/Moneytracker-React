/**
 * Money Tracker - Local Storage Utilities
 * Handles data persistence using localStorage
 */

// User data keys
const USER_KEY = 'money_tracker_user';
const USERS_KEY = 'money_tracker_users';
const ACCOUNTS_KEY = 'money_tracker_accounts';
const TRANSACTIONS_KEY = 'money_tracker_transactions';
const CATEGORIES_KEY = 'money_tracker_categories';
const SHOPPING_LIST_KEY = 'money_tracker_shopping_list';
const BUDGETS_KEY = 'money_tracker_budgets';
const SETTINGS_KEY = 'money_tracker_settings';

// Default data
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food', type: 'expense', icon: 'restaurant' },
  { id: '2', name: 'Transport', type: 'expense', icon: 'directions_car' },
  { id: '3', name: 'Shopping', type: 'expense', icon: 'shopping_bag' },
  { id: '4', name: 'Bills', type: 'expense', icon: 'receipt' },
  { id: '5', name: 'Salary', type: 'income', icon: 'work' },
  { id: '6', name: 'Gifts', type: 'income', icon: 'card_giftcard' },
];

const DEFAULT_ACCOUNTS = [
  { id: '1', name: 'Cash', balance: 0, icon: 'payments' },
  { id: '2', name: 'Bank Account', balance: 0, icon: 'account_balance' },
];

const DEFAULT_SETTINGS = {
  theme: 'light',
  currency: 'USD',
  profilePicture: null,
};

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Get current user
 * @returns {Object|null} - Current user or null if not logged in
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Set current user
 * @param {Object} user - User object
 */
export const setCurrentUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear current user (logout)
 */
export const clearCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Get all users
 * @returns {Array} - Array of users
 */
export const getUsers = () => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

/**
 * Save users
 * @param {Array} users - Array of users
 */
export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - Result object with success and message
 */
export const registerUser = (username, password) => {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return { success: false, message: 'Username already exists' };
  }
  
  // Create new user
  const newUser = {
    id: generateId(),
    username,
    password,
    createdAt: new Date().toISOString()
  };
  
  // Add user to users array
  users.push(newUser);
  saveUsers(users);
  
  // Initialize user data
  initializeUserData(newUser.id);
  
  return { success: true, user: { ...newUser, password: undefined } };
};

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - Result object with success and user/message
 */
export const loginUser = (username, password) => {
  const users = getUsers();
  
  // Find user
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }
  
  // Set current user (without password)
  const userWithoutPassword = { ...user, password: undefined };
  setCurrentUser(userWithoutPassword);
  
  return { success: true, user: userWithoutPassword };
};

/**
 * Initialize user data
 * @param {string} userId - User ID
 */
export const initializeUserData = (userId) => {
  // Initialize categories
  if (!localStorage.getItem(`${userId}_${CATEGORIES_KEY}`)) {
    localStorage.setItem(`${userId}_${CATEGORIES_KEY}`, JSON.stringify(DEFAULT_CATEGORIES));
  }
  
  // Initialize accounts
  if (!localStorage.getItem(`${userId}_${ACCOUNTS_KEY}`)) {
    localStorage.setItem(`${userId}_${ACCOUNTS_KEY}`, JSON.stringify(DEFAULT_ACCOUNTS));
  }
  
  // Initialize transactions
  if (!localStorage.getItem(`${userId}_${TRANSACTIONS_KEY}`)) {
    localStorage.setItem(`${userId}_${TRANSACTIONS_KEY}`, JSON.stringify([]));
  }
  
  // Initialize shopping list
  if (!localStorage.getItem(`${userId}_${SHOPPING_LIST_KEY}`)) {
    localStorage.setItem(`${userId}_${SHOPPING_LIST_KEY}`, JSON.stringify([]));
  }
  
  // Initialize budgets
  if (!localStorage.getItem(`${userId}_${BUDGETS_KEY}`)) {
    localStorage.setItem(`${userId}_${BUDGETS_KEY}`, JSON.stringify([]));
  }
  
  // Initialize settings
  if (!localStorage.getItem(`${userId}_${SETTINGS_KEY}`)) {
    localStorage.setItem(`${userId}_${SETTINGS_KEY}`, JSON.stringify(DEFAULT_SETTINGS));
  }
};

/**
 * Get user data
 * @param {string} key - Data key
 * @returns {Array|Object} - User data
 */
export const getUserData = (key) => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const dataKey = `${user.id}_${key}`;
  const dataJson = localStorage.getItem(dataKey);
  
  return dataJson ? JSON.parse(dataJson) : null;
};

/**
 * Save user data
 * @param {string} key - Data key
 * @param {Array|Object} data - Data to save
 */
export const saveUserData = (key, data) => {
  const user = getCurrentUser();
  if (!user) return;
  
  const dataKey = `${user.id}_${key}`;
  localStorage.setItem(dataKey, JSON.stringify(data));
};

/**
 * Get user accounts
 * @returns {Array} - User accounts
 */
export const getAccounts = () => {
  return getUserData(ACCOUNTS_KEY) || [];
};

/**
 * Save user accounts
 * @param {Array} accounts - Accounts to save
 */
export const saveAccounts = (accounts) => {
  saveUserData(ACCOUNTS_KEY, accounts);
};

/**
 * Get user transactions
 * @returns {Array} - User transactions
 */
export const getTransactions = () => {
  return getUserData(TRANSACTIONS_KEY) || [];
};

/**
 * Save user transactions
 * @param {Array} transactions - Transactions to save
 */
export const saveTransactions = (transactions) => {
  saveUserData(TRANSACTIONS_KEY, transactions);
};

/**
 * Get user categories
 * @returns {Array} - User categories
 */
export const getCategories = () => {
  return getUserData(CATEGORIES_KEY) || [];
};

/**
 * Save user categories
 * @param {Array} categories - Categories to save
 */
export const saveCategories = (categories) => {
  saveUserData(CATEGORIES_KEY, categories);
};

/**
 * Get user shopping list
 * @returns {Array} - User shopping list
 */
export const getShoppingList = () => {
  return getUserData(SHOPPING_LIST_KEY) || [];
};

/**
 * Save user shopping list
 * @param {Array} shoppingList - Shopping list to save
 */
export const saveShoppingList = (shoppingList) => {
  saveUserData(SHOPPING_LIST_KEY, shoppingList);
};

/**
 * Get user budgets
 * @returns {Array} - User budgets
 */
export const getBudgets = () => {
  return getUserData(BUDGETS_KEY) || [];
};

/**
 * Save user budgets
 * @param {Array} budgets - Budgets to save
 */
export const saveBudgets = (budgets) => {
  saveUserData(BUDGETS_KEY, budgets);
};

/**
 * Get user settings
 * @returns {Object} - User settings
 */
export const getSettings = () => {
  return getUserData(SETTINGS_KEY) || DEFAULT_SETTINGS;
};

/**
 * Save user settings
 * @param {Object} settings - Settings to save
 */
export const saveSettings = (settings) => {
  saveUserData(SETTINGS_KEY, settings);
};

/**
 * Get account by ID
 * @param {string} accountId - Account ID
 * @returns {Object|null} - Account or null if not found
 */
export const getAccountById = (accountId) => {
  const accounts = getAccounts();
  return accounts.find(account => account.id === accountId) || null;
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|null} - Category or null if not found
 */
export const getCategoryById = (categoryId) => {
  const categories = getCategories();
  return categories.find(category => category.id === categoryId) || null;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount) => {
  const settings = getSettings();
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: settings.currency || 'USD'
  });
  
  return formatter.format(amount);
};

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Export user data
 * @returns {Object} - User data
 */
export const exportUserData = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  return {
    accounts: getAccounts(),
    transactions: getTransactions(),
    categories: getCategories(),
    shoppingList: getShoppingList(),
    budgets: getBudgets(),
    settings: getSettings()
  };
};

/**
 * Import user data
 * @param {Object} data - User data
 * @returns {boolean} - Success
 */
export const importUserData = (data) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    if (data.accounts) saveAccounts(data.accounts);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.categories) saveCategories(data.categories);
    if (data.shoppingList) saveShoppingList(data.shoppingList);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.settings) saveSettings(data.settings);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Get user profile
 * @param {string} username - Username
 * @returns {Object|null} - User profile or null if not found
 */
export const getUserProfile = (username) => {
  if (!username) return null;
  
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) return null;
  
  // Get user settings
  const settings = getUserData(SETTINGS_KEY) || DEFAULT_SETTINGS;
  
  return {
    name: user.name || username,
    email: user.email || '',
    photo: user.photo || null,
    theme: settings.theme || 'light',
    currency: settings.currency || 'USD',
    language: settings.language || 'en'
  };
};

/**
 * Save user profile
 * @param {string} username - Username
 * @param {Object} profile - Profile data
 * @returns {boolean} - Success status
 */
export const saveUserProfile = (username, profile) => {
  if (!username || !profile) return false;
  
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) return false;
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: profile.name,
      email: profile.email,
      photo: profile.photo
    };
    
    // Save updated users
    saveUsers(users);
    
    // Update settings
    const settings = getUserData(SETTINGS_KEY) || DEFAULT_SETTINGS;
    saveUserData(SETTINGS_KEY, {
      ...settings,
      theme: profile.theme,
      currency: profile.currency,
      language: profile.language
    });
    
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

/**
 * Get all user data
 * @returns {Object} - All user data
 */
export const getAllData = () => {
  const user = getCurrentUser();
  if (!user) return null;

  return {
    user: user,
    accounts: getAccounts(),
    transactions: getTransactions(),
    categories: getCategories(),
    shoppingList: getShoppingList(),
    budgets: getBudgets(),
    settings: getSettings()
  };
};

/**
 * Set all user data
 * @param {Object} data - All user data
 */
export const setAllData = (data) => {
  if (!data) return;

  const user = getCurrentUser();
  if (!user) return;

  if (data.accounts) saveAccounts(data.accounts);
  if (data.transactions) saveTransactions(data.transactions);
  if (data.categories) saveCategories(data.categories);
  if (data.shoppingList) saveShoppingList(data.shoppingList);
  if (data.budgets) saveBudgets(data.budgets);
  if (data.settings) saveSettings(data.settings);
};
