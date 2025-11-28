// 封禁模拟器主应用
class FengjinSimulator {
    constructor() {
        this.screens = {
            login: 'login-screen',
            game: 'game-screen', 
            complaint: 'complaint-screen',
            main: 'main-screen'
        };
        
        this.currentUser = null;
        this.violationPoints = 0;
        this.banHistory = [];
        
        this.init();
    }

    init() {
        console.log('🎮 封禁模拟器初始化...');
        this.bindEvents();
        this.checkExistingUser();
    }

    // 事件绑定
    bindEvents() {
        // 登录界面事件
        const nicknameInput = document.getElementById('nickname-input');
        const startButton = document.getElementById('start-button');
        
        nicknameInput.addEventListener('input', (e) => this.validateNickname(e.target.value));
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        startButton.addEventListener('click', () => this.handleLogin());
        
        // 游戏界面事件
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        
        // 投诉界面事件
        document.getElementById('complain-yes').addEventListener('click', () => this.handleComplaint(true));
        document.getElementById('complain-no').addEventListener('click', () => this.handleComplaint(false));
        
        // 主界面事件
        document.getElementById('action-post').addEventListener('click', () => this.simulateAction('post'));
        document.getElementById('action-comment').addEventListener('click', () => this.simulateAction('comment'));
        document.getElementById('action-share').addEventListener('click', () => this.simulateAction('share'));
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // 屏幕管理
    showScreen(screenId) {
        // 隐藏所有屏幕
        Object.values(this.screens).forEach(screen => {
            document.getElementById(screen).classList.remove('active');
        });
        
        // 显示目标屏幕
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`切换到屏幕: ${screenId}`);
        }
        
        // 屏幕特定初始化
        this.onScreenShow(screenId);
    }

    onScreenShow(screenId) {
        switch(screenId) {
            case this.screens.game:
                this.initGame();
                break;
            case this.screens.main:
                this.updateMainScreen();
                break;
        }
    }

    // 用户管理
    validateNickname(nickname) {
        const errorElement = document.getElementById('error-message');
        const button = document.getElementById('start-button');
        
        const trimmed = nickname.trim();
        
        if (trimmed.length === 0) {
            this.showError('昵称不能为空');
            return false;
        } else if (trimmed.length < 2) {
            this.showError('昵称至少需要2个字符');
            return false;
        } else if (trimmed.length > 20) {
            this.showError('昵称不能超过20个字符');
            return false;
        } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(trimmed)) {
            this.showError('昵称只能包含中文、英文、数字、下划线和减号');
            return false;
        } else {
            this.clearError();
            return true;
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        const button = document.getElementById('start-button');
        
        errorElement.textContent = message;
        button.disabled = true;
    }

    clearError() {
        const errorElement = document.getElementById('error-message');
        const button = document.getElementById('start-button');
        
        errorElement.textContent = '';
        button.disabled = false;
    }

    async handleLogin() {
        const nickname = document.getElementById('nickname-input').value.trim();
        const button = document.getElementById('start-button');
        
        if (!this.validateNickname(nickname)) return;
        
        // 显示加载状态
        this.setLoadingState(true);
        
        try {
            // 模拟API调用
            await this.simulateApiCall(1500);
            
            // 保存用户
            this.saveUser(nickname);
            
            // 显示成功动画
            await this.showSuccessAnimation();
            
            // 跳转到游戏界面
            this.showScreen(this.screens.game);
            
        } catch (error) {
            this.showError('登录失败，请重试');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        const button = document.getElementById('start-button');
        const buttonText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.loading-spinner');
        
        if (loading) {
            button.disabled = true;
            buttonText.textContent = '登录中...';
            spinner.style.display = 'block';
        } else {
            button.disabled = false;
            buttonText.textContent = '开始体验';
            spinner.style.display = 'none';
        }
    }

    simulateApiCall(duration = 1000) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    saveUser(nickname) {
        this.currentUser = nickname;
        localStorage.setItem('current_user', nickname);
        localStorage.setItem('user_login_time', new Date().toISOString());
    }

    async showSuccessAnimation() {
        const button = document.getElementById('start-button');
        const originalBackground = button.style.background;
        
        button.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        button.querySelector('.btn-text').textContent = '登录成功！';
        
        await this.simulateApiCall(800);
    }

    checkExistingUser() {
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
            document.getElementById('nickname-input').value = storedUser;
            document.getElementById('nickname-input').placeholder = `上次用户: ${storedUser}`;
            this.validateNickname(storedUser);
        }
    }

    // 游戏功能
    initGame() {
        console.log('初始化贪吃蛇游戏...');
        // 这里将实现贪吃蛇游戏逻辑
        document.getElementById('player-name').textContent = this.currentUser || '游客';
        
        // 临时显示游戏界面
        this.showGameInstructions();
    }

    showGameInstructions() {
        alert(`欢迎 ${this.currentUser}！\n\n游戏说明：\n• 使用方向键控制蛇的移动\n• 躲避墙壁和自身\n• 游戏30秒后自动结束\n• 你的选择将影响后续体验`);
    }

    togglePause() {
        // 游戏暂停/继续逻辑
        console.log('游戏暂停/继续');
    }

    // 投诉处理
    handleComplaint(complained) {
        if (complained) {
            console.log('用户选择投诉游戏');
            this.violationPoints += 2; // 投诉增加违规点
            this.addBanRecord('投诉游戏系统', '警告', 2);
        } else {
            console.log('用户选择不投诉');
        }
        
        this.showScreen(this.screens.main);
    }

    // 主界面功能
    updateMainScreen() {
        document.getElementById('current-user').textContent = this.currentUser || '用户';
        document.getElementById('violation-points').textContent = this.violationPoints;
        this.updateBanHistory();
    }

    simulateAction(actionType) {
        const actions = {
            post: { points: 1, message: '发布内容' },
            comment: { points: 1, message: '发表评论' },
            share: { points: 1, message: '分享内容' }
        };
        
        const action = actions[actionType];
        if (!action) return;
        
        this.violationPoints += action.points;
        this.addBanRecord(action.message, '检测中', action.points);
        
        // 检查是否触发封禁
        this.checkForBan();
        
        this.updateMainScreen();
    }

    addBanRecord(action, status, points) {
        const record = {
            id: Date.now(),
            action,
            status,
            points,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.banHistory.unshift(record);
    }

    updateBanHistory() {
        const banList = document.getElementById('ban-list');
        const noRecords = banList.querySelector('.no-records');
        
        if (this.banHistory.length === 0) {
            noRecords.style.display = 'block';
            return;
        }
        
        noRecords.style.display = 'none';
        
        // 清空现有记录（除了无记录提示）
        Array.from(banList.children).forEach(child => {
            if (!child.classList.contains('no-records')) {
                child.remove();
            }
        });
        
        // 添加新记录
        this.banHistory.slice(0, 5).forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'ban-record';
            recordElement.innerHTML = `
                <span>${record.action}</span>
                <span class="status-${record.status}">${record.status}</span>
                <span>+${record.points}</span>
                <span>${record.timestamp}</span>
            `;
            banList.appendChild(recordElement);
        });
    }

    checkForBan() {
        if (this.violationPoints >= 10) {
            this.triggerPermanentBan();
        } else if (this.violationPoints >= 5) {
            this.triggerTemporaryBan();
        }
    }

    triggerTemporaryBan() {
        console.log('触发临时封禁');
        // 实现临时封禁逻辑
    }

    triggerPermanentBan() {
        console.log('触发永久封禁');
        // 实现永久封禁逻辑
    }

    // 键盘事件处理
    handleKeyPress(event) {
        // 游戏控制将在贪吃蛇游戏中实现
        if (this.currentScreen === this.screens.game) {
            this.handleGameControls(event);
        }
    }

    handleGameControls(event) {
        // 贪吃蛇游戏控制逻辑
        console.log('游戏控制:', event.key);
    }
}

// 贪吃蛇游戏类
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    init() {
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.resetGame();
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameTime = 0;
        this.isPaused = false;
        this.gameOver = false;
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }

    draw() {
        // 绘制游戏逻辑
    }

    update() {
        // 更新游戏状态
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主应用
    window.app = new FengjinSimulator();
    
    // 页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('🚀 封禁模拟器已启动！');
});

// 工具函数
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}