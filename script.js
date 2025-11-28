// === JS_CONSTANTS 开始 ===
// 应用常量和配置设置
const CONFIG = {
    // 屏幕ID常量
    SCREENS: {
        LOGIN: 'login-screen',
        MENU: 'menu-screen', 
        GAME: 'game-screen',
        INVITE: 'invite-screen',
        COMPLAINT: 'complaint-screen',
        BANNED: 'banned-screen',
        SETTINGS: 'settings-screen'
    },
    
    // 开发者模式设置
    DEVELOPER: {
        NICKNAME: 'admin',
        SHORTCUTS: {
            ADD_COINS: 'Ctrl+Shift+G',
            RESET_DATA: 'Ctrl+Shift+R',
            TOGGLE_PANEL: 'Ctrl+Shift+D'
        }
    },
    
    // 游戏配置
    GAME: {
        GRID_SIZE: 20,
        TILE_COUNT: 20,
        UPDATE_INTERVAL: 150,
        GAME_DURATION: 60000 // 60秒游戏时间
    },
    
    // 抽奖配置
    LOTTERY: {
        SPIN_COST: 1,
        BASE_GOLD_CHANCE: 0.001, // 0.1%
        PITY_THRESHOLD: 100,
        REWARDS: {
            DIAMOND: { type: 'diamond', amount: 9, weight: 90 },
            GOLD: { type: 'gold', amount: 1, weight: 10 }
        }
    },
    
    // 货币兑换率
    EXCHANGE_RATES: {
        WELFARE_TO_LUCK: 10,
        LUCK_TO_DIAMOND: 10, 
        DIAMOND_TO_GOLD: 10
    },
    
    // 本地存储键名
    STORAGE_KEYS: {
        USER_DATA: 'fengjin_user_data',
        GAME_STATE: 'fengjin_game_state',
        LOTTERY_HISTORY: 'fengjin_lottery_history'
    }
};

// 默认用户数据
const DEFAULT_USER_DATA = {
    nickname: '',
    isDeveloper: false,
    violationPoints: 0,
    banHistory: [],
    loginCount: 0,
    firstLogin: null,
    lastLogin: null
};

// 默认游戏数据
const DEFAULT_GAME_DATA = {
    currency: {
        gold: 0,
        diamond: 0, 
        luck: 0,
        welfare: 10
    },
    lotteryHistory: [],
    spinCount: 0,
    pityCounter: 0,
    lastSpin: null
};
// === JS_CONSTANTS 结束 ===
// === JS_UTILS 开始 ===
// 通用工具函数库
class Utils {
    // DOM 操作工具
    static $(selector) {
        return document.querySelector(selector);
    }
    
    static $$(selector) {
        return document.querySelectorAll(selector);
    }
    
    static createElement(tag, classes = '', content = '') {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (content) element.innerHTML = content;
        return element;
    }
    
    // 显示/隐藏元素
    static show(element) {
        if (typeof element === 'string') element = this.$(element);
        if (element) element.style.display = 'block';
    }
    
    static hide(element) {
        if (typeof element === 'string') element = this.$(element);
        if (element) element.style.display = 'none';
    }
    
    static toggle(element, force) {
        if (typeof element === 'string') element = this.$(element);
        if (element) {
            element.style.display = force === undefined ? 
                (element.style.display === 'none' ? 'block' : 'none') :
                (force ? 'block' : 'none');
        }
    }
    
    // 动画工具
    static fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            if (typeof element === 'string') element = this.$(element);
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity.toString();
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    static fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            if (typeof element === 'string') element = this.$(element);
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(1 - progress / duration, 0);
                
                element.style.opacity = opacity.toString();
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    // 随机数生成
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    static weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) return item;
        }
        return items[items.length - 1];
    }
    
    // 时间格式化
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    static formatDate(date) {
        return new Date(date).toLocaleString('zh-CN');
    }
    
    // 验证工具
    static validateNickname(nickname) {
        if (!nickname || nickname.trim().length === 0) {
            return { valid: false, message: '昵称不能为空' };
        }
        
        const trimmed = nickname.trim();
        
        if (trimmed.length < 2) {
            return { valid: false, message: '昵称至少需要2个字符' };
        }
        
        if (trimmed.length > 20) {
            return { valid: false, message: '昵称不能超过20个字符' };
        }
        
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(trimmed)) {
            return { valid: false, message: '昵称只能包含中文、英文、数字、下划线和减号' };
        }
        
        return { valid: true, message: '' };
    }
    
    // 存储工具
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 通知系统
    static showNotification(message, type = 'info', duration = 3000) {
        // 移除现有通知
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = Utils.createElement('div', `notification notification-${type}`, message);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            Utils.fadeOut(notification).then(() => notification.remove());
        }, duration);
        
        return notification;
    }
}
// === JS_UTILS 结束 ===
// === JS_STORAGE 开始 ===
// 数据存储和管理类
class StorageManager {
    constructor() {
        this.keys = CONFIG.STORAGE_KEYS;
        this.init();
    }
    
    init() {
        // 初始化默认数据
        if (!this.getUserData()) {
            this.setUserData(DEFAULT_USER_DATA);
        }
        
        if (!this.getGameData()) {
            this.setGameData(DEFAULT_GAME_DATA);
        }
    }
    
    // 用户数据管理
    getUserData() {
        try {
            const data = localStorage.getItem(this.keys.USER_DATA);
            return data ? { ...DEFAULT_USER_DATA, ...JSON.parse(data) } : null;
        } catch (error) {
            console.error('读取用户数据失败:', error);
            return null;
        }
    }
    
    setUserData(data) {
        try {
            localStorage.setItem(this.keys.USER_DATA, JSON.stringify({
                ...this.getUserData(),
                ...data,
                lastLogin: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    }
    
    updateUserData(updates) {
        const current = this.getUserData() || DEFAULT_USER_DATA;
        return this.setUserData({ ...current, ...updates });
    }
    
    // 游戏数据管理
    getGameData() {
        try {
            const data = localStorage.getItem(this.keys.GAME_STATE);
            return data ? { ...DEFAULT_GAME_DATA, ...JSON.parse(data) } : null;
        } catch (error) {
            console.error('读取游戏数据失败:', error);
            return null;
        }
    }
    
    setGameData(data) {
        try {
            localStorage.setItem(this.keys.GAME_STATE, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存游戏数据失败:', error);
            return false;
        }
    }
    
    updateGameData(updates) {
        const current = this.getGameData() || DEFAULT_GAME_DATA;
        return this.setGameData({ ...current, ...updates });
    }
    
    // 货币操作
    getCurrency(currencyType) {
        const gameData = this.getGameData();
        return gameData?.currency?.[currencyType] || 0;
    }
    
    updateCurrency(currencyType, amount) {
        const gameData = this.getGameData() || DEFAULT_GAME_DATA;
        const newAmount = Math.max(0, (gameData.currency[currencyType] || 0) + amount);
        
        gameData.currency[currencyType] = newAmount;
        return this.setGameData(gameData);
    }
    
    hasEnoughCurrency(currencyType, amount) {
        return this.getCurrency(currencyType) >= amount;
    }
    
    // 抽奖记录
    getLotteryHistory() {
        try {
            const history = localStorage.getItem(this.keys.LOTTERY_HISTORY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('读取抽奖记录失败:', error);
            return [];
        }
    }
    
    addLotteryRecord(record) {
        try {
            const history = this.getLotteryHistory();
            history.unshift({
                ...record,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            
            // 只保留最近100条记录
            const trimmedHistory = history.slice(0, 100);
            localStorage.setItem(this.keys.LOTTERY_HISTORY, JSON.stringify(trimmedHistory));
            return true;
        } catch (error) {
            console.error('保存抽奖记录失败:', error);
            return false;
        }
    }
    
    // 数据清理
    clearUserData() {
        localStorage.removeItem(this.keys.USER_DATA);
    }
    
    clearGameData() {
        localStorage.removeItem(this.keys.GAME_STATE);
        localStorage.removeItem(this.keys.LOTTERY_HISTORY);
    }
    
    clearAllData() {
        this.clearUserData();
        this.clearGameData();
    }
    
    // 数据导出/导入
    exportData() {
        return {
            user: this.getUserData(),
            game: this.getGameData(),
            lottery: this.getLotteryHistory(),
            exportTime: new Date().toISOString()
        };
    }
    
    importData(data) {
        try {
            if (data.user) this.setUserData(data.user);
            if (data.game) this.setGameData(data.game);
            if (data.lottery) {
                localStorage.setItem(this.keys.LOTTERY_HISTORY, JSON.stringify(data.lottery));
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
    
    // 统计信息
    getStats() {
        const userData = this.getUserData() || DEFAULT_USER_DATA;
        const gameData = this.getGameData() || DEFAULT_GAME_DATA;
        const lotteryHistory = this.getLotteryHistory();
        
        return {
            user: {
                loginCount: userData.loginCount || 0,
                violationPoints: userData.violationPoints || 0,
                banCount: userData.banHistory?.length || 0
            },
            game: {
                totalSpins: gameData.spinCount || 0,
                totalGold: gameData.currency?.gold || 0,
                totalDiamond: gameData.currency?.diamond || 0
            },
            lottery: {
                totalSpins: lotteryHistory.length,
                goldWins: lotteryHistory.filter(r => r.reward.type === 'gold').length,
                lastWin: lotteryHistory[0]?.timestamp || null
            }
        };
    }
}
// === JS_STORAGE 结束 ===
// === JS_SCREEN_MANAGER 开始 ===
// 屏幕管理和路由控制
class ScreenManager {
    constructor() {
        this.screens = CONFIG.SCREENS;
        this.currentScreen = null;
        this.screenHistory = [];
        this.init();
    }
    
    init() {
        this.hideAllScreens();
        this.showScreen(this.screens.LOGIN);
        this.bindGlobalEvents();
    }
    
    // 屏幕显示控制
    showScreen(screenId, addToHistory = true) {
        // 验证屏幕ID
        const validScreens = Object.values(this.screens);
        if (!validScreens.includes(screenId)) {
            console.error(`未知的屏幕ID: ${screenId}`);
            console.log('可用屏幕:', validScreens);
            return false;
        }
        
        // 隐藏当前屏幕
        if (this.currentScreen) {
            this.hideScreen(this.currentScreen);
        }
        
        // 显示新屏幕
        const screenElement = document.getElementById(screenId);
        if (screenElement) {
            screenElement.classList.add('active');
            this.currentScreen = screenId;
            
            // 添加到历史记录
            if (addToHistory && screenId !== this.screens.LOGIN) {
                this.screenHistory.push(screenId);
            }
            
            // 触发屏幕显示事件
            this.onScreenShow(screenId);
            
            console.log(`✅ 切换到屏幕: ${screenId}`);
            return true;
        }
        
        console.error(`❌ 屏幕元素未找到: ${screenId}`);
        return false;
    }
    
    hideScreen(screenId) {
        const screenElement = document.getElementById(screenId);
        if (screenElement) {
            screenElement.classList.remove('active');
        }
    }
    
    hideAllScreens() {
        Object.values(this.screens).forEach(screenId => {
            this.hideScreen(screenId);
        });
    }
    
    // 屏幕历史管理
    goBack() {
        if (this.screenHistory.length > 0) {
            const previousScreen = this.screenHistory.pop();
            this.showScreen(previousScreen, false);
            return true;
        }
        return false;
    }
    
    clearHistory() {
        this.screenHistory = [];
    }
    
    // 屏幕事件处理
    onScreenShow(screenId) {
        // 屏幕特定的初始化逻辑
        switch(screenId) {
            case this.screens.LOGIN:
                this.initLoginScreen();
                break;
            case this.screens.MENU:
                this.initMenuScreen();
                break;
            case this.screens.GAME:
                this.initGameScreen();
                break;
            case this.screens.INVITE:
                this.initInviteScreen();
                break;
                // MAIN screen removed — no init required
        }
        
        // 触发自定义事件
        this.triggerScreenEvent('screenShow', screenId);
    }
    
    // 屏幕初始化方法
    initLoginScreen() {
        // 聚焦到输入框
        setTimeout(() => {
            const input = document.getElementById('nickname-input');
            if (input) input.focus();
        }, 100);
        
        // 检查已保存的用户
        this.checkSavedUser();
    }
    
    initMenuScreen() {
        // 更新用户信息显示
        this.updateMenuDisplay();
        
        // 绑定菜单卡片点击事件
        this.bindMenuCardEvents();
        
        // 绑定右上角设置按钮（如果存在）
        const settingsBtn = document.getElementById('menu-settings-btn');
        if (settingsBtn) {
            try { if (settingsBtn.__click) settingsBtn.removeEventListener('click', settingsBtn.__click); } catch(e){}
            settingsBtn.__click = () => { this.showScreen(this.screens.SETTINGS); };
            settingsBtn.addEventListener('click', settingsBtn.__click);
        }
    }
    
    // 新增方法：绑定菜单卡片事件
    bindMenuCardEvents() {
        const menuCards = document.querySelectorAll('.menu-card');
        console.log(`🔍 找到 ${menuCards.length} 个菜单卡片`);
        
        menuCards.forEach((card, index) => {
            // 使用元素属性保存绑定引用，确保可以正确解绑，避免重复监听
            try {
                if (card.__menuClickHandler) {
                    card.removeEventListener('click', card.__menuClickHandler);
                }
            } catch (e) {
                // ignore
            }

            const handler = (e) => this.handleMenuCardClick(e);
            card.__menuClickHandler = handler;
            card.addEventListener('click', handler);
            console.log(`✅ 绑定菜单卡片 ${index + 1}: ${card.getAttribute('data-target')}`);
        });
    }
    
    handleMenuCardClick(event) {
        const card = event.currentTarget;
        const targetScreen = card.getAttribute('data-target');
        console.log(`🎯 点击菜单卡片，目标: ${targetScreen}`);
        if (!targetScreen) {
            console.error('❌ 未设置 data-target:', card);
            return;
        }

        // 支持两种 data-target：
        // - 直接使用屏幕 ID（例如 'game-screen'）
        // - 使用 CONFIG.SCREENS 的键名（例如 'GAME'）映射到实际 ID
        const screensObj = this.screens || {};
        // 如果是 KEY 名称（如 'GAME'）
        if (screensObj[targetScreen]) {
            this.showScreen(screensObj[targetScreen]);
            return;
        }

        // 如果直接是屏幕 ID（如 'game-screen'）
        const validScreens = Object.values(screensObj);
        if (validScreens.includes(targetScreen)) {
            this.showScreen(targetScreen);
            return;
        }

        console.error('❌ 无效的屏幕目标:', targetScreen);
    }
    
    initGameScreen() {
        console.log('🎮 初始化游戏界面');
        // 初始化游戏
        if (window.gameManager) {
            window.gameManager.init();
        }
    }
    
    initInviteScreen() {
        console.log('🎰 初始化抽奖界面');
        // 初始化抽奖系统
        if (window.lotteryManager) {
            window.lotteryManager.init();
        }
    }
    
    initMainScreen() {
        console.log('⚖️ 初始化主界面');
        // 更新主界面状态
        if (window.authManager) {
            window.authManager.updateMainScreen();
        }
    }
    
    // 工具方法
    checkSavedUser() {
        const userData = window.storageManager ? window.storageManager.getUserData() : null;
        if (userData && userData.nickname) {
            const input = document.getElementById('nickname-input');
            if (input) {
                input.value = userData.nickname;
                input.placeholder = `上次用户: ${userData.nickname}`;
            }
        }
    }
    
    updateMenuDisplay() {
        const userData = window.storageManager ? window.storageManager.getUserData() : null;
        const usernameElement = document.getElementById('menu-username');
        const devBadgeElement = document.getElementById('developer-badge');
        
        if (usernameElement && userData) {
            usernameElement.textContent = userData.nickname || '用户';
        }
        
        if (devBadgeElement) {
            if (userData && userData.isDeveloper) {
                devBadgeElement.style.display = 'inline-block';
            } else {
                devBadgeElement.style.display = 'none';
            }
        }
    }
    
    // 事件系统
    triggerScreenEvent(eventName, screenId) {
        const event = new CustomEvent('screenChange', {
            detail: { screenId, eventName }
        });
        document.dispatchEvent(event);
    }
    
    // 全局事件绑定
    bindGlobalEvents() {
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            // ESC键返回
            if (e.key === 'Escape') {
                if (this.currentScreen !== this.screens.LOGIN && 
                    this.currentScreen !== this.screens.MENU) {
                    e.preventDefault();
                    this.goBack();
                }
            }
            
            // 开发者快捷键
            if (e.ctrlKey && e.shiftKey) {
                this.handleDeveloperShortcuts(e);
            }
        });
        
        // 屏幕变化事件监听
        document.addEventListener('screenChange', (e) => {
            console.log('🔄 屏幕变化:', e.detail);
        });
    }
    
    handleDeveloperShortcuts(e) {
        if (!window.authManager || !window.authManager.isDeveloperMode) return;
        
        switch(e.key) {
            case 'D': // Ctrl+Shift+D - 切换开发者面板
                e.preventDefault();
                console.log('🔧 开发者快捷键: D');
                break;
            case 'R': // Ctrl+Shift+R - 重置数据
                e.preventDefault();
                console.log('🔧 开发者快捷键: R');
                break;
            case 'G': // Ctrl+Shift+G - 添加金币
                e.preventDefault();
                console.log('🔧 开发者快捷键: G');
                if (window.lotteryManager) {
                    window.lotteryManager.addCurrency('gold', 100);
                }
                break;
        }
    }
    
    // 获取当前屏幕信息
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    getScreenHistory() {
        return [...this.screenHistory];
    }
    
    isScreenActive(screenId) {
        return this.currentScreen === screenId;
    }
}
// === JS_SCREEN_MANAGER 结束 ===
// === JS_AUTH_MANAGER 开始 ===
// 用户认证和权限管理
class AuthManager {
    constructor(storageManager, screenManager) {
        this.storage = storageManager;
        this.screens = screenManager;
        this.currentUser = null;
        this.isDeveloperMode = false;
        this.init();
    }
    
    init() {
        this.bindAuthEvents();
        this.checkExistingSession();
    }
    
    // 事件绑定
    bindAuthEvents() {
        // 登录表单事件
        const nicknameInput = document.getElementById('nickname-input');
        const startButton = document.getElementById('start-button');
        
        if (nicknameInput) {
            nicknameInput.addEventListener('input', (e) => {
                this.validateInput(e.target.value);
            });
            
            nicknameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.handleLogin();
            });
        }
        
        // 注：已移除“切换账号”按钮，游戏仅允许单账号登录
    }
    
    // 输入验证
    validateInput(nickname) {
        const result = Utils.validateNickname(nickname);
        this.showValidationResult(result);
        return result.valid;
    }
    
    showValidationResult(result) {
        const errorElement = document.getElementById('error-message');
        const button = document.getElementById('start-button');
        
        if (errorElement && button) {
            errorElement.textContent = result.message;
            button.disabled = !result.valid;
            
            const input = document.getElementById('nickname-input');
            if (input) {
                input.style.borderColor = result.valid ? '#48bb78' : '#e53e3e';
            }
        }
    }
    
    // 登录处理
    async handleLogin() {
        const nicknameInput = document.getElementById('nickname-input');
        if (!nicknameInput) return;
        
        const nickname = nicknameInput.value.trim();
        
        if (!this.validateInput(nickname)) return;
        
        // 设置加载状态
        this.setLoadingState(true);
        
        try {
            // 模拟API调用延迟
            await this.simulateApiCall(1000 + Math.random() * 500);
            
            // 检查开发者模式
            if (nickname.toLowerCase() === CONFIG.DEVELOPER.NICKNAME) {
                await this.handleDeveloperLogin(nickname);
            } else {
                await this.handleNormalLogin(nickname);
            }
            
        } catch (error) {
            Utils.showNotification('登录失败，请重试', 'error');
            console.error('登录错误:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    // 普通用户登录
    async handleNormalLogin(nickname) {
        // 检查存储的用户是否被封禁（非开发者账号）
        const stored = this.storage.getUserData() || {};

        // 保存用户数据（保留已存在的封禁信息）
        const userData = {
            nickname: nickname,
            isDeveloper: false,
            banned: stored.banned || false,
            banReason: stored.banReason || null,
            banHistory: stored.banHistory || [],
            loginCount: (this.storage.getUserData()?.loginCount || 0) + 1,
            firstLogin: this.storage.getUserData()?.firstLogin || new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        this.storage.setUserData(userData);
        this.currentUser = userData;

        // 显示成功动画
        await this.showLoginSuccess();

        // 若账号被封禁，则跳转到专用的封禁着陆页；否则进入主菜单
        if (userData.banned) {
            if (this.screens && this.screens.screens && this.screens.screens.BANNED) {
                this.screens.showScreen(this.screens.screens.BANNED);
                try { this.updateBannedScreen(); } catch(e){}
            } else {
                // If no banned screen available, fallback to menu
                this.screens.showScreen(this.screens.screens.MENU);
            }
            return;
        }

        // 跳转到主菜单
        this.screens.showScreen(this.screens.screens.MENU);
    }
    
    // 开发者模式登录
    async handleDeveloperLogin(nickname) {
        console.log('🎮 开发者模式激活');
        
        // 设置开发者数据
        const userData = {
            nickname: nickname,
            isDeveloper: true,
            loginCount: (this.storage.getUserData()?.loginCount || 0) + 1,
            firstLogin: this.storage.getUserData()?.firstLogin || new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // 若账号在存储中被标记为封禁，开发者仍然可以登录以进行解封操作
        const stored = this.storage.getUserData() || {};
        userData.banned = stored.banned || false;
        userData.banReason = stored.banReason || null;
        userData.banHistory = stored.banHistory || [];

        this.storage.setUserData(userData);
        this.currentUser = userData;
        this.isDeveloperMode = true;
        
        // 显示开发者特效
        await this.showDeveloperWelcome();
        
        // 初始化开发者工具
        this.initDeveloperTools();
        
        // 跳转到主菜单
        this.screens.showScreen(this.screens.screens.MENU);
    }
    
    // 登录UI效果
    setLoadingState(loading) {
        const button = document.getElementById('start-button');
        const buttonText = button?.querySelector('.btn-text');
        const spinner = button?.querySelector('.loading-spinner');
        
        if (!button || !buttonText) return;
        
        if (loading) {
            button.disabled = true;
            buttonText.textContent = '登录中...';
            if (spinner) spinner.style.display = 'block';
        } else {
            button.disabled = false;
            buttonText.textContent = '开始体验';
            if (spinner) spinner.style.display = 'none';
        }
    }
    
    async showLoginSuccess() {
        const button = document.getElementById('start-button');
        if (!button) return;
        
        const originalText = button.querySelector('.btn-text').textContent;
        const originalBackground = button.style.background;
        
        button.querySelector('.btn-text').textContent = '登录成功！';
        button.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        button.querySelector('.btn-text').textContent = originalText;
        button.style.background = originalBackground;
    }
    
    async showDeveloperWelcome() {
        const button = document.getElementById('start-button');
        if (!button) return;
        
        button.querySelector('.btn-text').textContent = '开发者模式激活！';
        button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        
        // 添加脉冲动画
        document.body.style.animation = 'developerPulse 2s infinite';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 开发者工具
    initDeveloperTools() {
        this.createDeveloperBadge();
        this.setupDeveloperShortcuts();
        this.createDeveloperPanel();
        
        Utils.showNotification('开发者工具已激活', 'success');
    }
    
    createDeveloperBadge() {
        const existingBadge = document.getElementById('developer-badge');
        if (existingBadge) return;
        
        const badge = Utils.createElement('div', 'developer-badge', '🔧 开发者模式');
        badge.id = 'developer-badge';
        document.body.appendChild(badge);
    }
    
    setupDeveloperShortcuts() {
        console.log('🔧 开发者快捷键已启用');
    }
    
    createDeveloperPanel() {
        // 开发者面板创建逻辑
    }
    
    // 会话管理：如果存在已保存用户则限制切换账号，普通被封号用户无法再登录
    checkExistingSession() {
        const userData = this.storage.getUserData();
        const input = document.getElementById('nickname-input');
        const startButton = document.getElementById('start-button');
        const errorElement = document.getElementById('error-message');

        if (!userData || !userData.nickname) return;
        // 如果账号被封禁
        if (userData.banned && userData.nickname.toLowerCase() !== CONFIG.DEVELOPER.NICKNAME) {
            // 恢复会话并跳转到封禁着陆页
            this.currentUser = userData;
            this.isDeveloperMode = false;
            Utils.showNotification(`检测到封禁会话：${userData.nickname}`, 'warning');
            if (this.screens && this.screens.screens && this.screens.screens.BANNED) {
                this.screens.showScreen(this.screens.screens.BANNED);
                try { this.updateBannedScreen(); } catch(e){}
            }
            return;
        }

        // 如果是开发者账号或未封禁普通账号，恢复会话并跳转到菜单
        this.currentUser = userData;
        this.isDeveloperMode = userData.isDeveloper || (userData.nickname && userData.nickname.toLowerCase() === CONFIG.DEVELOPER.NICKNAME);
        Utils.showNotification(`恢复会话：${userData.nickname}`, 'info');
        this.screens.showScreen(this.screens.screens.MENU);
    }
    
    // 登出处理
    handleLogout() {
        // 清除会话数据（保留其他数据）
        const userData = this.storage.getUserData();
        if (userData) {
            userData.lastLogin = new Date().toISOString();
            this.storage.setUserData(userData);
        }
        
        this.currentUser = null;
        this.isDeveloperMode = false;
        
        // 移除开发者徽章
        const badge = document.getElementById('developer-badge');
        if (badge) badge.remove();
        
        // 返回登录界面
        this.screens.showScreen(this.screens.screens.LOGIN);
        this.screens.clearHistory();
        
        Utils.showNotification('已退出登录', 'info');
    }
    
    // 工具方法
    simulateApiCall(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    isDeveloper() {
        return this.isDeveloperMode;
    }
    
    // 主界面更新
    updateMainScreen() {
        // 更新主界面用户信息
        const userData = this.storage.getUserData();
        const userElement = document.getElementById('current-user');
        const pointsElement = document.getElementById('violation-points');
        
        if (userElement && userData) {
            userElement.textContent = userData.nickname || '用户';
        }
        
        if (pointsElement) {
            pointsElement.textContent = userData?.violationPoints || 0;
        }
        
        // 管理账号状态显示
        const statusElement = document.getElementById('account-status');
        if (statusElement) {
            if (userData?.banned) {
                statusElement.textContent = '已封禁';
                statusElement.classList.add('banned');
                statusElement.classList.remove('normal');
            } else {
                statusElement.textContent = '正常';
                statusElement.classList.add('normal');
                statusElement.classList.remove('banned');
            }
        }

        // 管理一键解封按钮（仅开发者可见并且该账号处于封禁状态）
        const unbanBtn = document.getElementById('unban-btn');
        if (unbanBtn) {
            if (userData?.banned && userData?.nickname && userData.nickname.toLowerCase() === CONFIG.DEVELOPER.NICKNAME && this.isDeveloperMode) {
                unbanBtn.style.display = 'inline-block';
                unbanBtn.onclick = () => this.unbanCurrentUser();
            } else {
                unbanBtn.style.display = 'none';
                unbanBtn.onclick = null;
            }
        }
    }

    // 更新被封页面内容并绑定事件
    updateBannedScreen() {
        const userData = this.storage.getUserData() || {};
        const nickEl = document.getElementById('banned-nickname');
        const reasonEl = document.getElementById('banned-reason');
        const atEl = document.getElementById('banned-at');
        const historyContainer = document.getElementById('banned-history-list');
        const unbanBtn = document.getElementById('banned-unban-btn');

        if (nickEl) nickEl.textContent = userData.nickname || '用户';
        if (reasonEl) reasonEl.textContent = userData.banReason || '未记录具体原因';
        if (atEl) atEl.textContent = userData.bannedAt ? new Date(userData.bannedAt).toLocaleString() : '-';

        if (historyContainer) {
            historyContainer.innerHTML = '';
            const list = userData.banHistory || [];
            if (list.length === 0) {
                const div = document.createElement('div');
                div.className = 'no-records';
                div.textContent = '暂无记录';
                historyContainer.appendChild(div);
            } else {
                list.forEach(entry => {
                    const item = document.createElement('div');
                    item.className = 'ban-entry';
                    item.textContent = `${entry.at || entry.timestamp || ''} — ${entry.reason || entry.action || JSON.stringify(entry)}`;
                    historyContainer.appendChild(item);
                });
            }
        }

        // 绑定按钮事件
        this.bindBannedEvents();

        // 显示/隐藏开发者解封按钮
        if (unbanBtn) {
            const isDev = this.currentUser?.isDeveloper || (this.currentUser?.nickname && this.currentUser.nickname.toLowerCase() === CONFIG.DEVELOPER.NICKNAME);
            if (isDev && this.isDeveloperMode) {
                unbanBtn.style.display = 'inline-block';
                unbanBtn.onclick = () => this.unbanCurrentUser();
            } else {
                unbanBtn.style.display = 'none';
                unbanBtn.onclick = null;
            }
        }
    }

    bindBannedEvents() {
        const contact = document.getElementById('banned-contact');
        const appeal = document.getElementById('banned-appeal');
        const backLogin = document.getElementById('banned-back-login');

        if (contact) contact.onclick = () => { if (window.customerService) window.customerService.open('complaint'); };

        // 申诉/申请解封按钮：若当前存储用户为 admin，则提示登录成功；否则跳转到独立的解封抽取页
        if (appeal) appeal.onclick = () => {
            try {
                const stored = this.storage.getUserData() || {};
                const nick = (stored.nickname || '').toLowerCase();
                if (nick === CONFIG.DEVELOPER.NICKNAME) {
                    Utils.showNotification('管理员登录成功（模拟）', 'success');
                } else {
                    // 非管理员跳转到独立页面，页面上包含抽取解封机会和投诉入口
                    window.location.href = 'unban_lottery.html';
                }
            } catch (e) {
                window.location.href = 'unban_lottery.html';
            }
        };

        if (backLogin) backLogin.onclick = () => { this.handleLogout(); };
    }

    // 封禁当前用户（被游戏超时触发）
    banCurrentUser(reason = 'system timeout') {
        const userData = this.storage.getUserData() || {};
        const now = new Date().toISOString();
        userData.banned = true;
        userData.banReason = reason;
        userData.bannedAt = now;
        userData.banHistory = userData.banHistory || [];
        userData.banHistory.push({ reason, at: now, by: 'system' });
        this.storage.setUserData(userData);

        Utils.showNotification('检测到违规行为，账号已被封禁。', 'error');

        // 强制登出并回到登录界面
        this.handleLogout();
    }

    // 解封当前用户（开发者专用）
    unbanCurrentUser() {
        const userData = this.storage.getUserData() || {};
        if (!userData.banned) {
            Utils.showNotification('账号未被封禁', 'info');
            return;
        }

        const now = new Date().toISOString();
        userData.banned = false;
        userData.unbannedAt = now;
        userData.banHistory = userData.banHistory || [];
        userData.banHistory.push({ action: 'unban', at: now, by: 'developer' });
        this.storage.setUserData(userData);

        Utils.showNotification('已为该账号解除封禁（开发者操作）', 'success');
        this.updateMainScreen();
    }
}
// === JS_AUTH_MANAGER 结束 ===
// === JS_GAME_MANAGER 开始 ===
// 贪吃蛇游戏实现
class GameManager {
    constructor(canvasId = 'snake-canvas') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.resetGame();
        this.bindControls();
        this.gameLoop = this.gameLoop.bind(this);
    }

    resetGame() {
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.lastUpdateTime = 0;
        this.updateInterval = 150; // 毫秒

        this.updateDisplay();
        // 显示开始按钮以便测试/手动启动
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) startBtn.style.display = 'inline-block';
    }

    generateFood() {
        let newFood;
        let onSnake;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            onSnake = this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        } while (onSnake);
        
        return newFood;
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;

            switch(e.key) {
                case 'ArrowUp':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    this.togglePause();
                    break;
            }
        });

        // 触摸控制（移动端支持）
        this.setupTouchControls();

        // 控制按钮绑定（使用元素上保存的引用以便安全解绑）
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            try { if (startBtn.__clickHandler) startBtn.removeEventListener('click', startBtn.__clickHandler); } catch(e){}
            startBtn.__clickHandler = () => this.startGame();
            startBtn.addEventListener('click', startBtn.__clickHandler);
        }

        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            try { if (pauseBtn.__clickHandler) pauseBtn.removeEventListener('click', pauseBtn.__clickHandler); } catch(e){}
            pauseBtn.__clickHandler = () => this.togglePause();
            pauseBtn.addEventListener('click', pauseBtn.__clickHandler);
        }

        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) {
            try { if (exitBtn.__clickHandler) exitBtn.removeEventListener('click', exitBtn.__clickHandler); } catch(e){}
            exitBtn.__clickHandler = () => {
                this.resetGame();
                if (window.screenManager) window.screenManager.showScreen(CONFIG.SCREENS.MENU);
            };
            exitBtn.addEventListener('click', exitBtn.__clickHandler);
        }
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 0 && this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                } else if (dx < 0 && this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
            } else {
                // 垂直滑动
                if (dy > 0 && this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                } else if (dy < 0 && this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
            }

            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        });
    }

    startGame() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        // 隐藏开始按钮以避免重复点击
        const startBtnEl = document.getElementById('start-game-btn');
        if (startBtnEl) startBtnEl.style.display = 'none';
        this.startTime = Date.now();
        this.lastUpdateTime = performance.now();
        this.gameTimer = setInterval(() => {
            const elapsedMs = Date.now() - this.startTime;
            this.gameTime = Math.floor(elapsedMs / 1000);
            this.updateTimeDisplay();

            // 检查游戏时间结束（使用 CONFIG.GAME.GAME_DURATION 毫秒）
            if (elapsedMs >= (CONFIG.GAME.GAME_DURATION || 60000) && !this.gameOver) {
                this.endGame('timeout');
            }
        }, 1000);
        
        requestAnimationFrame(this.gameLoop);
        this.updateGameStatus('游戏进行中...');
    }

    gameLoop(currentTime) {
        if (!this.isRunning || this.isPaused || this.gameOver) return;

        const deltaTime = currentTime - this.lastUpdateTime;
        
        if (deltaTime > this.updateInterval) {
            this.update();
            this.draw();
            this.lastUpdateTime = currentTime;
        }
        
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        if (this.dx === 0 && this.dy === 0) return;

        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.endGame('collision');
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateScoreDisplay();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // 撞墙检测
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 撞自身检测
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制食物
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#48bb78';
            } else {
                // 蛇身
                this.ctx.fillStyle = '#38a169';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });
    }

    togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        this.updateGameStatus(this.isPaused ? '游戏已暂停' : '游戏进行中...');
        
        if (!this.isPaused) {
            this.lastUpdateTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    endGame(reason = 'collision') {
        this.isRunning = false;
        this.gameOver = true;
        clearInterval(this.gameTimer);
        
        const reasons = {
            'collision': '游戏结束！蛇撞到了墙壁或自己。',
            'timeout': '时间到！游戏自动结束'
        };
        
        this.updateGameStatus(reasons[reason] || '游戏结束');
        
        // 如果因为超时导致游戏结束，则触发封号逻辑并强制登出
        if (reason === 'timeout') {
            setTimeout(() => {
                if (window.authManager) {
                    window.authManager.banCurrentUser('游戏超时触发封号');
                } else {
                    // 回退：显示游戏结束页面
                    this.showGameOverScreen();
                }
            }, 800);
            return;
        }

        // 显示最终分数
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }

    showGameOverScreen() {
        document.getElementById('final-score').textContent = this.score;
        window.screenManager.showScreen('complaint-screen');
    }

    updateDisplay() {
        this.updateScoreDisplay();
        this.updateTimeDisplay();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateTimeDisplay() {
        const timeElement = document.getElementById('game-time');
        if (timeElement) {
            timeElement.textContent = this.gameTime;
        }
    }

    updateGameStatus(status) {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}
// === JS_GAME_MANAGER 结束 ===
// === JS_LOTTERY_MANAGER_1 开始 ===
// 抽奖和邀请助力系统 - 第一部分：核心逻辑
class LotteryManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.isSpinning = false;
        this.lotteryConfig = CONFIG.LOTTERY;
        this.init();
    }
    
    init() {
        this.loadGameData();
        this.bindEvents();
        this.updateDisplay();
    }
    
    // 数据管理
    loadGameData() {
        const gameData = this.storage.getGameData() || DEFAULT_GAME_DATA;
        this.currency = { ...gameData.currency };
        this.spinCount = gameData.spinCount || 0;
        this.pityCounter = gameData.pityCounter || 0;
        this.lotteryHistory = this.storage.getLotteryHistory();
    }
    
    saveGameData() {
        const gameData = {
            currency: this.currency,
            spinCount: this.spinCount,
            pityCounter: this.pityCounter,
            lastUpdate: new Date().toISOString()
        };
        
        this.storage.setGameData(gameData);
    }
    
    // 事件绑定
    bindEvents() {
        // 抽奖按钮
        const spinBtn = document.getElementById('spin-button');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => {
                this.handleSpin();
            });
        }
        
        // 兑换按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('exchange-btn')) {
                const from = e.target.dataset.from;
                const to = e.target.dataset.to;
                const rate = parseInt(e.target.dataset.rate);
                this.handleExchange(from, to, rate);
            }
            
            if (e.target.classList.contains('invite-btn')) {
                const reward = parseInt(e.target.dataset.reward);
                this.handleInvite(reward);
            }
        });
        
        // 模拟邀请按钮
        const simulateBtn = document.getElementById('simulate-invite');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                this.simulateMultipleInvites();
            });
        }
        
        // 返回按钮
        const backBtn = document.getElementById('back-to-menu');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.screenManager) {
                    window.screenManager.showScreen(CONFIG.SCREENS.MENU);
                }
            });
        }
    }
    
    // 抽奖逻辑
    async handleSpin() {
        if (this.isSpinning) return;
        
        // 检查金币是否足够
        if (!this.hasEnoughCurrency('gold', this.lotteryConfig.SPIN_COST)) {
            Utils.showNotification('金币不足，无法抽奖！', 'error');
            return;
        }
        
        this.isSpinning = true;
        
        try {
            // 扣除金币
            this.deductCurrency('gold', this.lotteryConfig.SPIN_COST);
            
            // 开始旋转动画
            await this.startSpinAnimation();
            
            // 计算奖励
            const reward = this.calculateReward();
            
            // 发放奖励
            this.addCurrency(reward.type, reward.amount);
            
            // 记录抽奖
            this.recordSpin(reward);
            
            // 更新显示
            this.updateDisplay();
            
            // 显示结果
            this.showReward(reward);
            
        } catch (error) {
            console.error('抽奖错误:', error);
            Utils.showNotification('抽奖失败，请重试', 'error');
        } finally {
            this.isSpinning = false;
            this.updateSpinButton();
        }
    }
    
    // 抽奖动画
    async startSpinAnimation() {
        const wheel = document.getElementById('lottery-wheel');
        if (!wheel) return;
        
        // 添加旋转类
        wheel.classList.add('spinning');
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(() => {
                wheel.classList.remove('spinning');
                resolve();
            }, 3000);
        });
    }
    
    // 奖励计算
    calculateReward() {
        this.spinCount++;
        this.pityCounter++;
        
        // 保底机制
        if (this.pityCounter >= this.lotteryConfig.PITY_THRESHOLD) {
            this.pityCounter = 0;
            return { type: 'gold', amount: 1, isGold: true };
        }
        
        // 正常概率计算
        const random = Math.random();
        if (random < this.lotteryConfig.BASE_GOLD_CHANCE) {
            this.pityCounter = 0;
            return { type: 'gold', amount: 1, isGold: true };
        }
        
        // 普通奖励（永远差一点）
        return { 
            type: 'diamond', 
            amount: 9, // 给9个，差1个到10
            isGold: false 
        };
    }
    
    // 货币操作
    hasEnoughCurrency(currencyType, amount) {
        return (this.currency[currencyType] || 0) >= amount;
    }
    
    deductCurrency(currencyType, amount) {
        if (this.hasEnoughCurrency(currencyType, amount)) {
            this.currency[currencyType] -= amount;
            this.saveGameData();
            return true;
        }
        return false;
    }
    
    addCurrency(currencyType, amount) {
        this.currency[currencyType] = (this.currency[currencyType] || 0) + amount;
        this.saveGameData();
        return true;
    }
    
    // 兑换处理
    handleExchange(from, to, rate) {
        if (!this.hasEnoughCurrency(from, rate)) {
            Utils.showNotification(`${this.getCurrencyName(from)}不足！`, 'error');
            return;
        }
        
        this.deductCurrency(from, rate);
        this.addCurrency(to, 1);
        
        Utils.showNotification(
            `兑换成功！${rate}${this.getCurrencyIcon(from)} → 1${this.getCurrencyIcon(to)}`,
            'success'
        );
        
        this.updateDisplay();
    }
    
    // 邀请助力
    handleInvite(reward) {
        this.addCurrency('welfare', reward);
        
        Utils.showNotification(
            `邀请成功！获得 ${reward}${this.getCurrencyIcon('welfare')}`,
            'success'
        );
        
        // 模拟网络延迟
        setTimeout(() => {
            Utils.showNotification('好友已成功助力！', 'info');
        }, 1000);
        
        this.updateDisplay();
    }
    
    simulateMultipleInvites() {
        const rewards = [5, 10, 20, 5, 10, 50]; // 模拟多个好友助力
        let total = 0;
        
        rewards.forEach((reward, index) => {
            setTimeout(() => {
                this.addCurrency('welfare', reward);
                total += reward;
                this.updateDisplay();
                
                if (index === rewards.length - 1) {
                    Utils.showNotification(`模拟完成！共获得 ${total}🎫`, 'success');
                }
            }, index * 500);
        });
    }
    
    // 记录管理
    recordSpin(reward) {
        const record = {
            id: Date.now(),
            reward: reward,
            timestamp: new Date().toLocaleTimeString('zh-CN'),
            spinCount: this.spinCount
        };
        
        this.lotteryHistory.unshift(record);
        this.storage.addLotteryRecord(record);
    }
    
    // 显示更新
    updateDisplay() {
        this.updateCurrencyDisplay();
        this.updateSpinButton();
        this.updateLotteryHistory();
        this.updatePityCounter();
    }
    
    updateCurrencyDisplay() {
        // 更新所有货币显示
        Object.keys(this.currency).forEach(currency => {
            const element = document.getElementById(`${currency}-amount`);
            if (element) {
                element.textContent = this.currency[currency];
            }
        });
    }
    
    updateSpinButton() {
        const spinBtn = document.getElementById('spin-button');
        if (!spinBtn) return;
        
        const canSpin = this.hasEnoughCurrency('gold', this.lotteryConfig.SPIN_COST);
        spinBtn.disabled = !canSpin || this.isSpinning;
        
        if (this.isSpinning) {
            spinBtn.innerHTML = '<span class="spin-text">抽奖中...</span>';
        } else {
            spinBtn.innerHTML = `
                <span class="spin-text">抽奖一次</span>
                <span class="spin-cost">消耗: ${this.lotteryConfig.SPIN_COST}🪙</span>
            `;
        }
    }
    
    updateLotteryHistory() {
        const historyContainer = document.getElementById('lottery-history');
        if (!historyContainer) return;
        
        const emptyMsg = historyContainer.querySelector('.history-empty');
        
        if (this.lotteryHistory.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }
        
        if (emptyMsg) emptyMsg.style.display = 'none';
        
        // 清空现有记录
        Array.from(historyContainer.children).forEach(child => {
            if (!child.classList.contains('history-empty')) {
                child.remove();
            }
        });
        
        // 添加新记录（最多10条）
        this.lotteryHistory.slice(0, 10).forEach(record => {
            const historyItem = Utils.createElement('div', 'history-item');
            historyItem.innerHTML = `
                <span>第${record.spinCount}抽</span>
                <span class="history-reward">${record.reward.amount}${this.getCurrencyIcon(record.reward.type)}</span>
                <span class="history-time">${record.timestamp}</span>
            `;
            
            if (record.reward.isGold) {
                historyItem.style.background = 'rgba(255, 215, 0, 0.2)';
            }
            
            historyContainer.appendChild(historyItem);
        });
    }
    
    updatePityCounter() {
        const pityElement = document.getElementById('pity-count');
        const chanceElement = document.getElementById('gold-chance');
        
        if (pityElement) {
            pityElement.textContent = this.pityCounter;
        }
        
        if (chanceElement) {
            // 显示虚假概率（实际概率的10倍）
            const displayChance = (this.lotteryConfig.BASE_GOLD_CHANCE * 1000).toFixed(1);
            chanceElement.textContent = `${displayChance}%`;
        }
    }
// === JS_LOTTERY_MANAGER_1 结束 ===
// === JS_LOTTERY_MANAGER_2 开始 ===
// 抽奖和邀请助力系统 - 第二部分：显示和工具方法

    // 奖励显示
    showReward(reward) {
        if (reward.isGold) {
            this.showGoldAnimation();
            Utils.showNotification('🎉 恭喜获得金币！', 'success', 5000);
        } else {
            Utils.showNotification(
                `获得了 ${reward.amount} ${this.getCurrencyName(reward.type)}`,
                'info'
            );
        }
    }
    
    showGoldAnimation() {
        const goldEffect = Utils.createElement('div', 'gold-effect', '🪙');
        goldEffect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4em;
            z-index: 10000;
            animation: goldPop 1s ease-out;
        `;
        
        document.body.appendChild(goldEffect);
        
        setTimeout(() => {
            goldEffect.remove();
        }, 1000);
    }
    
    // 工具函数
    getCurrencyIcon(currencyType) {
        const icons = {
            gold: '🪙',
            diamond: '💎',
            luck: '🍀',
            welfare: '🎫'
        };
        return icons[currencyType] || '❓';
    }
    
    getCurrencyName(currencyType) {
        const names = {
            gold: '金币',
            diamond: '钻石',
            luck: '幸运值',
            welfare: '福利值'
        };
        return names[currencyType] || '未知货币';
    }
    
    // 开发者工具
    addCurrency(currencyType, amount) {
        this.currency[currencyType] = (this.currency[currencyType] || 0) + amount;
        this.saveGameData();
        this.updateDisplay();
        
        Utils.showNotification(`+${amount}${this.getCurrencyIcon(currencyType)}`, 'success');
    }
    
    resetData() {
        this.currency = { ...DEFAULT_GAME_DATA.currency };
        this.spinCount = 0;
        this.pityCounter = 0;
        this.lotteryHistory = [];
        this.storage.clearGameData();
        this.updateDisplay();
        
        Utils.showNotification('抽奖数据已重置', 'info');
    }
    
    // 调试方法
    enableDebugMode() {
        console.log('🎰 抽奖系统调试模式已启用');
        console.log('当前货币:', this.currency);
        console.log('抽奖次数:', this.spinCount);
        console.log('保底计数:', this.pityCounter);
        console.log('抽奖记录:', this.lotteryHistory);
    }
    
    // 统计信息
    getStats() {
        return {
            totalSpins: this.spinCount,
            totalGold: this.currency.gold || 0,
            totalDiamond: this.currency.diamond || 0,
            totalLuck: this.currency.luck || 0,
            totalWelfare: this.currency.welfare || 0,
            pityCounter: this.pityCounter,
            goldWins: this.lotteryHistory.filter(r => r.reward.isGold).length,
            winRate: this.spinCount > 0 ? 
                (this.lotteryHistory.filter(r => r.reward.isGold).length / this.spinCount * 100).toFixed(2) + '%' : '0%'
        };
    }
    
    // 导出数据
    exportData() {
        return {
            currency: this.currency,
            spinCount: this.spinCount,
            pityCounter: this.pityCounter,
            lotteryHistory: this.lotteryHistory,
            exportTime: new Date().toISOString()
        };
    }
    
    // 导入数据
    importData(data) {
        try {
            if (data.currency) this.currency = { ...data.currency };
            if (data.spinCount) this.spinCount = data.spinCount;
            if (data.pityCounter) this.pityCounter = data.pityCounter;
            if (data.lotteryHistory) this.lotteryHistory = [...data.lotteryHistory];
            
            this.saveGameData();
            this.updateDisplay();
            
            Utils.showNotification('数据导入成功', 'success');
            return true;
        } catch (error) {
            console.error('数据导入失败:', error);
            Utils.showNotification('数据导入失败', 'error');
            return false;
        }
    }
    
    // 重置特定货币
    resetCurrency(currencyType) {
        if (this.currency.hasOwnProperty(currencyType)) {
            const oldValue = this.currency[currencyType];
            this.currency[currencyType] = 0;
            this.saveGameData();
            this.updateDisplay();
            
            Utils.showNotification(
                `${this.getCurrencyName(currencyType)}已重置: ${oldValue} → 0`,
                'info'
            );
        }
    }
    
    // 模拟抽奖（用于测试）
    simulateSpins(count = 10) {
        let goldWins = 0;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const reward = this.calculateReward();
                if (reward.isGold) goldWins++;
                
                this.addCurrency(reward.type, reward.amount);
                this.recordSpin(reward);
                
                if (i === count - 1) {
                    this.updateDisplay();
                    Utils.showNotification(
                        `模拟完成！${count}次抽奖中获得 ${goldWins} 次金币`,
                        'success'
                    );
                }
            }, i * 100);
        }
    }
    
    // 批量兑换
    bulkExchange(from, to, rate, times = 1) {
        const totalCost = rate * times;
        
        if (!this.hasEnoughCurrency(from, totalCost)) {
            Utils.showNotification(`${this.getCurrencyName(from)}不足！需要 ${totalCost}`, 'error');
            return false;
        }
        
        this.deductCurrency(from, totalCost);
        this.addCurrency(to, times);
        
        Utils.showNotification(
            `批量兑换成功！${totalCost}${this.getCurrencyIcon(from)} → ${times}${this.getCurrencyIcon(to)}`,
            'success'
        );
        
        this.updateDisplay();
        return true;
    }
    
    // 获取下一次金币保底信息
    getNextPityInfo() {
        const spinsToPity = this.lotteryConfig.PITY_THRESHOLD - this.pityCounter;
        const chance = this.lotteryConfig.BASE_GOLD_CHANCE * 100;
        
        return {
            spinsToPity: spinsToPity,
            currentPity: this.pityCounter,
            pityThreshold: this.lotteryConfig.PITY_THRESHOLD,
            baseChance: chance.toFixed(3) + '%',
            nextSpinChance: (this.pityCounter >= this.lotteryConfig.PITY_THRESHOLD - 1) ? 
                '100% (保底)' : ((chance / (this.lotteryConfig.PITY_THRESHOLD - this.pityCounter)).toFixed(3) + '%')
        };
    }
    
    // 格式化显示信息
    formatCurrency(amount, currencyType) {
        const icons = {
            gold: '🪙',
            diamond: '💎', 
            luck: '🍀',
            welfare: '🎫'
        };
        
        return `${amount}${icons[currencyType] || ''}`;
    }
    
    formatStats() {
        const stats = this.getStats();
        return `
🎰 抽奖统计：
• 总抽奖次数: ${stats.totalSpins}
• 金币获得次数: ${stats.goldWins}
• 中奖率: ${stats.winRate}
• 当前货币:
  - 金币: ${this.formatCurrency(stats.totalGold, 'gold')}
  - 钻石: ${this.formatCurrency(stats.totalDiamond, 'diamond')}
  - 幸运值: ${this.formatCurrency(stats.totalLuck, 'luck')}
  - 福利值: ${this.formatCurrency(stats.totalWelfare, 'welfare')}
• 保底计数: ${stats.pityCounter}/${this.lotteryConfig.PITY_THRESHOLD}
        `.trim();
    }
}
// === JS_LOTTERY_MANAGER_2 结束 ===
// === JS_CUSTOMER_SERVICE 开始 ===
class CustomerService {
    constructor(storageManager, screenManager, authManager) {
        this.storage = storageManager;
        this.screens = screenManager;
        this.auth = authManager;
        this.init();
    }

    init() {
        this.bindUI();
        this.canned = this.buildCannedResponses();
    }

    bindUI() {
        const contactBtn = document.getElementById('contact-support');
        if (contactBtn) contactBtn.addEventListener('click', () => this.open());

        const backBtn = document.getElementById('customer-back');
        if (backBtn) backBtn.addEventListener('click', () => this.close());

        const quicks = document.querySelectorAll('.quick-btn');
        quicks.forEach(b => b.addEventListener('click', (e) => this.handleQuick(e)));

        const sendBtn = document.getElementById('customer-send');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());

        const input = document.getElementById('customer-input');
        if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(); });
    }

    buildCannedResponses() {
        return {
            appeal: [
                '您好，您选择了申诉解封。请提供被封账号的昵称与简要说明，我们会创建申诉工单。',
                '提示：普通玩家的封禁为永久模拟，只有开发者账号有权限直接解封。',
                '是否仍要提交申诉？提交后系统会记录工单，但不会自动解封。'
            ],
            query: [
                '您好，请说明您需要查询的账号，我们会展示封禁原因。',
                '系统提示：如是因游戏超时触发的封禁，原因将显示为“游戏超时触发封号”。'
            ],
            complaint: [
                '我们已收到您的投诉。请简述问题（例如：游戏卡顿/奖励异常）',
                '感谢您的反馈，平台会在模拟中记录该投诉，但不会影响当前封禁策略。'
            ],
            default: [
                '您好，这里是人工客服模拟，您可以选择或输入您的问题。',
                '说明：本系统为本地模拟，所有记录保存在本地浏览器。'
            ]
        };
    }

    open(topic) {
        this.screens.showScreen('customer-screen');
        this.appendAgent('您好，欢迎使用人工客服，请选择或输入您的问题。');
        if (topic) this.runTopic(topic);
        this.scrollChatToBottom();
    }

    close() {
        if (window.screenManager) window.screenManager.showScreen(CONFIG.SCREENS.MENU);
    }

    handleQuick(e) {
        const topic = e.currentTarget.getAttribute('data-topic');
        this.runTopic(topic);
    }

    runTopic(topic) {
        const replies = this.canned[topic] || this.canned.default;
        replies.forEach((r, i) => setTimeout(() => this.appendAgent(r), i * 700));
        // Special handling: if appeal, create a ticket record when user confirms
        if (topic === 'appeal') {
            setTimeout(() => this.appendAgent('若要提交申诉请在下方输入您的申诉说明并点击发送。'), replies.length * 700 + 200);
        }
        this.scrollChatToBottom();
    }

    appendAgent(text) {
        this.appendMessage('agent', text);
    }

    appendUser(text) {
        this.appendMessage('user', text);
    }

    appendMessage(who, text) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `msg ${who}`;
        div.textContent = text;
        container.appendChild(div);
        this.scrollChatToBottom();
    }

    scrollChatToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('customer-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        this.appendUser(text);
        input.value = '';

        // Basic intent matching
        const lowered = text.toLowerCase();
        if (lowered.includes('申诉') || lowered.includes('解封')) {
            // create ticket
            this.createTicket(text);
            setTimeout(() => this.appendAgent('申诉已提交，工单编号已保存。注意：此模拟中普通用户申诉不会解封。'), 600);
        } else if (lowered.includes('为什么') || lowered.includes('原因') || lowered.includes('封')) {
            const userData = this.storage.getUserData() || {};
            const reason = userData.banReason || '未记录具体原因';
            setTimeout(() => this.appendAgent(`封禁原因：${reason}`), 500);
        } else if (lowered.includes('客服') || lowered.includes('人工')) {
            setTimeout(() => this.appendAgent('我们是人工客服模拟，请选择申诉或投诉。'), 500);
        } else {
            setTimeout(() => this.appendAgent('已收到您的信息，我们的客服会尽快处理（模拟）。'), 500);
        }
    }

    createTicket(content) {
        const user = this.storage.getUserData() || {};
        const tickets = user.supportTickets || [];
        const ticket = { id: `T${Date.now()}`, content, status: 'submitted', at: new Date().toISOString() };
        tickets.push(ticket);
        user.supportTickets = tickets;
        this.storage.setUserData(user);
        this.appendAgent(`工单已创建：${ticket.id}（状态：${ticket.status}）`);
    }
}
// === JS_CUSTOMER_SERVICE 结束 ===
// === JS_MAIN_APP 开始 ===
// 主应用协调类
class FengjinSimulator {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        try {
            // 初始化组件
            await this.initializeComponents();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 启动应用
            this.startApplication();
            
            this.isInitialized = true;
            console.log('🎮 封禁模拟器初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorScreen('应用初始化失败，请刷新页面重试');
        }
    }
    
    // 组件初始化
    async initializeComponents() {
        // 初始化存储管理器
        this.components.storage = new StorageManager();
        window.storageManager = this.components.storage;

        // 初始化屏幕管理器
        this.components.screen = new ScreenManager();
        window.screenManager = this.components.screen;

        // 初始化认证管理器
        this.components.auth = new AuthManager(
            this.components.storage,
            this.components.screen
        );
        window.authManager = this.components.auth;

        // 初始化客服管理器
        this.components.customerService = new CustomerService(
            this.components.storage,
            this.components.screen,
            this.components.auth
        );
        window.customerService = this.components.customerService;

        // 延迟初始化游戏管理器（需要DOM元素）
        await this.initializeGameManager();

        // 初始化抽奖管理器
        this.components.lottery = new LotteryManager(this.components.storage);
        window.lotteryManager = this.components.lottery;

        // 保存到全局变量以便调试
        window.app = this;
    }
    
    async initializeGameManager() {
        return new Promise((resolve) => {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.components.game = new GameManager();
                    window.gameManager = this.components.game;
                    resolve();
                });
            } else {
                this.components.game = new GameManager();
                window.gameManager = this.components.game;
                resolve();
            }
        });
    }
    
    // 全局事件绑定
    bindGlobalEvents() {
        // 错误处理
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.handleError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise拒绝:', e.reason);
            this.handleError(e.reason);
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppHide();
            } else {
                this.onAppShow();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleGlobalShortcuts(e);
        });
    }
    
    // 应用生命周期
    startApplication() {
        Utils.showNotification('封禁模拟器已启动', 'success');
        
        // 显示加载完成动画
        this.showWelcomeAnimation();
        
        // 检查是否需要显示欢迎提示
        this.showWelcomeTips();
    }
    
    onAppHide() {
        // 应用进入后台时保存数据
        if (this.components.storage) {
            this.components.storage.saveGameData();
        }
        
        // 暂停游戏
        if (this.components.game) {
            this.components.game.pauseGame();
        }
    }
    
    onAppShow() {
        // 应用回到前台
        console.log('应用回到前台');
    }
    
    // 错误处理
    handleError(error) {
        console.error('应用错误:', error);
        
        // 生产环境下显示友好错误提示
        if (!this.isDevelopment()) {
            Utils.showNotification('发生错误，部分功能可能不可用', 'error');
        }
    }
    
    showErrorScreen(message) {
        // 显示错误界面
        const errorHtml = `
            <div class="error-screen">
                <h2>❌ 应用加载失败</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="primary-btn">重新加载</button>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }
    
    // 欢迎和提示系统
    showWelcomeAnimation() {
        // 添加欢迎动画效果
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
    
    showWelcomeTips() {
        const userData = this.components.storage.getUserData();
        
        // 首次使用提示
        if (!userData || userData.loginCount <= 1) {
            setTimeout(() => {
                Utils.showNotification('💡 提示：输入"admin"可进入开发者模式', 'info', 5000);
            }, 2000);
        }
    }
    
    // 快捷键处理
    handleGlobalShortcuts(e) {
        // 全局快捷键
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault(); // 阻止保存网页
            Utils.showNotification('数据已自动保存', 'info');
        }
        
        // 开发者快捷键
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            this.toggleDebugInfo();
        }
    }
    
    toggleDebugInfo() {
        // 切换调试信息显示
        const debugElement = document.getElementById('debug-info');
        if (!debugElement) {
            this.showDebugInfo();
        } else {
            debugElement.remove();
        }
    }
    
    showDebugInfo() {
        const debugInfo = Utils.createElement('div', 'debug-info');
        debugInfo.id = 'debug-info';
        debugInfo.innerHTML = `
            <h3>🔧 调试信息</h3>
            <pre>${JSON.stringify(this.getDebugData(), null, 2)}</pre>
        `;
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            max-height: 200px;
            overflow: auto;
            font-size: 12px;
        `;
        document.body.appendChild(debugInfo);
    }
    
    getDebugData() {
        return {
            timestamp: new Date().toISOString(),
            user: this.components.auth?.getCurrentUser() || '未登录',
            screen: this.components.screen?.getCurrentScreen() || '未知',
            game: this.components.game?.getGameState() || '未初始化',
            storage: this.components.storage?.getStats() || '无数据'
        };
    }
    
    // 工具方法
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }
    
    // 公共API
    getComponent(name) {
        return this.components[name];
    }
    
    restartApplication() {
        if (confirm('确定要重启应用吗？所有未保存的数据可能会丢失。')) {
            location.reload();
        }
    }
    
    // 销毁应用
    destroy() {
        // 清理所有组件
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // 移除全局引用
        window.app = null;
        window.storageManager = null;
        window.screenManager = null;
        window.authManager = null;
        window.gameManager = null;
        window.lotteryManager = null;
    }
}
// === JS_MAIN_APP 结束 ===
// === JS_INIT 开始 ===
// 应用初始化和启动代码

// CSS动画样式注入
const appStyles = `
    @keyframes developerPulse {
        0% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        50% { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); }
        100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    }
    
    @keyframes goldPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
    
    .notification-success { background: #48bb78; }
    .notification-error { background: #e53e3e; }
    .notification-info { background: #4299e1; }
    .notification-warning { background: #ed8936; }
    
    .developer-badge {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        font-weight: bold;
    }
    
    .gold-effect {
        animation: goldPop 1s ease-out;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

// 注入样式
const styleElement = document.createElement('style');
styleElement.textContent = appStyles;
document.head.appendChild(styleElement);

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 封禁模拟器启动中...');
    
    // 显示加载状态
    const loadingState = Utils.showNotification('应用加载中...', 'info', 0);
    
    // 延迟初始化以确保所有DOM元素就绪
    setTimeout(() => {
        try {
            // 创建主应用实例
            window.fengjinApp = new FengjinSimulator();
            
            // 移除加载通知
            if (loadingState && loadingState.remove) {
                loadingState.remove();
            }
            
            console.log('✅ 封禁模拟器启动完成');
            
        } catch (error) {
            console.error('❌ 应用启动失败:', error);
            
            // 显示错误界面
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <h1>❌ 应用加载失败</h1>
                        <p>抱歉，应用启动时遇到错误。</p>
                        <p style="font-size: 14px; opacity: 0.8;">${error.message}</p>
                        <button onclick="location.reload()" style="
                            background: white;
                            color: #667eea;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin-top: 20px;
                            cursor: pointer;
                        ">重新加载页面</button>
                    </div>
                </div>
            `;
        }
    }, 100);
    
    // 绑定投诉按钮事件
    bindComplaintEvents();
    // 绑定其它常用按钮（再玩一次、返回菜单、发帖等）
    if (typeof bindMiscUI === 'function') bindMiscUI();
});

// 绑定投诉按钮事件
function bindComplaintEvents() {
    const yesBtn = document.getElementById('complain-yes');
    if (yesBtn) {
        yesBtn.onclick = () => {
            if (window.customerService) {
                window.customerService.open('complaint');
            } else if (window.screenManager) {
                window.screenManager.showScreen('customer-screen');
            }
        };
    }
}

// 绑定其他常用UI按钮，确保它们有响应
function bindMiscUI() {
    // 再玩一次（重新开始游戏）
    const complainNo = document.getElementById('complain-no');
    if (complainNo) {
        complainNo.onclick = () => {
            if (window.gameManager) {
                window.gameManager.resetGame();
                if (window.screenManager) window.screenManager.showScreen(CONFIG.SCREENS.GAME);
            } else if (window.screenManager) {
                window.screenManager.showScreen(CONFIG.SCREENS.GAME);
            }
        };
    }

    // 主界面返回菜单
    const backMain = document.getElementById('back-to-menu-main');
    if (backMain) backMain.addEventListener('click', () => { if (window.screenManager) window.screenManager.showScreen(CONFIG.SCREENS.MENU); });

    // 设置页返回
    const backSettings = document.getElementById('back-to-menu-settings');
    if (backSettings) backSettings.addEventListener('click', () => { if (window.screenManager) window.screenManager.showScreen(CONFIG.SCREENS.MENU); });

    // 发帖 / 评论 / 分享：简单模拟动作
    const postBtn = document.getElementById('action-post');
    if (postBtn) postBtn.addEventListener('click', () => { Utils.showNotification('已发布内容（模拟）', 'success'); });

    const commentBtn = document.getElementById('action-comment');
    if (commentBtn) commentBtn.addEventListener('click', () => { Utils.showNotification('已发布评论（模拟）', 'success'); });

    const shareBtn = document.getElementById('action-share');
    if (shareBtn) shareBtn.addEventListener('click', () => { Utils.showNotification('已分享内容（模拟）', 'success'); });

    // 设置页开发者工具按钮：展示调试信息
    const devBtn = document.getElementById('dev-tools-btn');
    if (devBtn) devBtn.addEventListener('click', () => { if (window.app) window.app.toggleDebugInfo(); else Utils.showNotification('开发者面板不可用', 'info'); });
}

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
});

// 导出到全局作用域（用于调试）
window.Utils = Utils;
window.CONFIG = CONFIG;

console.log('📦 封禁模拟器模块加载完成');
// === JS_INIT 结束 ===