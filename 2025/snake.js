class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = {x: 0, y: 0, type: 'normal'};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        
        // 從 localStorage 讀取最高分和稱號
        const storedHighScore = localStorage.getItem('snakeHighScore');
        const storedHighScoreTitle = localStorage.getItem('snakeHighScoreTitle');
        this.highScore = storedHighScore ? parseInt(storedHighScore) : 0;
        this.highScoreTitle = storedHighScoreTitle || '新手';
        
        // 從 localStorage 讀取金幣
        const storedCoins = localStorage.getItem('snakeCoins');
        console.log('Stored coins:', storedCoins);
        this.coins = storedCoins && !isNaN(parseInt(storedCoins)) ? parseInt(storedCoins) : 0;
        console.log('Initial coins:', this.coins);
        
        // 從 localStorage 讀取金幣轉換率
        const storedRate = localStorage.getItem('coinConversionRate');
        this.coinConversionRate = storedRate ? parseFloat(storedRate) : 1;
        
        // 從 localStorage 讀取分數倍率
        const storedMultiplier = localStorage.getItem('scoreMultiplier');
        this.scoreMultiplier = storedMultiplier && !isNaN(parseInt(storedMultiplier)) ? parseInt(storedMultiplier) : 1;
        
        // 金幣轉換率升級
        this.baseCoinConversionCost = 500; // 基礎升級成本
        this.coinConversionCost = this.getCoinConversionCost(); // 計算當前升級成本
        
        // 分數倍率升級
        this.baseScoreMultiplierCost = 500; // 基礎升級成本
        this.scoreMultiplierCost = this.getScoreMultiplierCost(); // 計算當前升級成本
        
        this.gameActive = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.baseSpeed = 100; // 基礎速度
        this.speedEffectTimer = null; // 速度效果計時器
        this.gameStartTime = 0; // 遊戲開始時間
        
        // Upgrade levels
        this.upgradeLevels = {
            normal: parseInt(localStorage.getItem('normalUpgradeLevel')) || 0,
            fast: parseInt(localStorage.getItem('fastUpgradeLevel')) || 0,
            slow: parseInt(localStorage.getItem('slowUpgradeLevel')) || 0,
            bonus: parseInt(localStorage.getItem('bonusUpgradeLevel')) || 0,
            normalChance: parseInt(localStorage.getItem('normalChanceLevel')) || 0,
            fastChance: parseInt(localStorage.getItem('fastChanceLevel')) || 0,
            slowChance: parseInt(localStorage.getItem('slowChanceLevel')) || 0,
            bonusChance: parseInt(localStorage.getItem('bonusChanceLevel')) || 0
        };
        
        // Snake colors based on score
        this.snakeColors = {
            0: '#4ecdc4',    // 新手
            100: '#06d6a0',  // 初學者
            300: '#118ab2',  // 熟練者
            500: '#8338ec',  // 高手
            1000: '#ffd166', // 大師
            2000: '#ef476f'  // 傳奇
        };
        
        // Titles based on score
        this.titles = {
            0: '新手',
            100: '初學者',
            300: '熟練者',
            500: '高手',
            1000: '大師',
            2000: '傳奇'
        };
        
        // Food types and their effects
        this.foodTypes = {
            normal: { 
                basePoints: 10,
                baseSpeed: 0,
                baseChance: 0.6,
                upgradeCost: 50,
                chanceUpgradeCost: 200,
                color: '#ff6b6b',
                colorName: '紅色'
            },
            fast: { 
                basePoints: 25,
                baseSpeed: -40,
                baseChance: 0.15,
                upgradeCost: 100,
                chanceUpgradeCost: 200,
                color: '#ffd166',
                colorName: '黃色'
            },
            slow: { 
                basePoints: 20,
                baseSpeed: 10,
                baseChance: 0.15,
                upgradeCost: 75,
                chanceUpgradeCost: 200,
                color: '#06d6a0',
                colorName: '綠色'
            },
            bonus: { 
                basePoints: 25,
                baseMultiplier: 1.1,
                baseSpeed: 0,
                baseChance: 0.1,
                upgradeCost: 200,
                chanceUpgradeCost: 200,
                color: '#118ab2',
                colorName: '藍色'
            }
        };
        
        // 食物機率升級相關
        this.foodChanceLevels = {
            normal: parseInt(localStorage.getItem('normalChanceLevel')) || 0,
            fast: parseInt(localStorage.getItem('fastChanceLevel')) || 0,
            slow: parseInt(localStorage.getItem('slowChanceLevel')) || 0,
            bonus: parseInt(localStorage.getItem('bonusChanceLevel')) || 0
        };
        
        // 從 localStorage 讀取食物機率
        const storedNormalChance = localStorage.getItem('normalChance');
        const storedFastChance = localStorage.getItem('fastChance');
        const storedSlowChance = localStorage.getItem('slowChance');
        const storedBonusChance = localStorage.getItem('bonusChance');

        // 確保機率是有效的數字，否則使用初始值
        if (storedNormalChance && !isNaN(parseFloat(storedNormalChance))) {
            this.foodTypes.normal.baseChance = parseFloat(storedNormalChance);
        }
        if (storedFastChance && !isNaN(parseFloat(storedFastChance))) {
            this.foodTypes.fast.baseChance = parseFloat(storedFastChance);
        }
        if (storedSlowChance && !isNaN(parseFloat(storedSlowChance))) {
            this.foodTypes.slow.baseChance = parseFloat(storedSlowChance);
        }
        if (storedBonusChance && !isNaN(parseFloat(storedBonusChance))) {
            this.foodTypes.bonus.baseChance = parseFloat(storedBonusChance);
        }
        
        // 食物升級相關
        this.foodUpgradeLevels = {
            normal: parseInt(localStorage.getItem('normalFoodLevel')) || 0,
            fast: parseInt(localStorage.getItem('fastFoodLevel')) || 0,
            slow: parseInt(localStorage.getItem('slowFoodLevel')) || 0,
            bonus: parseInt(localStorage.getItem('bonusFoodLevel')) || 0
        };
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.titleElement = document.getElementById('title');
        this.highScoreTitleElement = document.getElementById('high-score-title');
        this.coinsElement = document.getElementById('coins');
        this.earnedCoinsElement = document.getElementById('earned-coins');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.upgradeBtn = document.getElementById('upgrade-btn');
        this.gameOverScreen = document.getElementById('game-over');
        this.upgradeScreen = document.getElementById('upgrade-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalTitleElement = document.getElementById('final-title');
        this.restartBtn = document.getElementById('restart-btn');
        this.closeUpgradeBtn = document.getElementById('close-upgrade');
        this.speedStatusElement = document.getElementById('speed-status');
        
        // 確保所有必要的 DOM 元素都存在
        if (!this.coinsElement || !this.earnedCoinsElement) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.upgradeBtn.addEventListener('click', () => this.showUpgradeScreen());
        this.closeUpgradeBtn.addEventListener('click', () => this.hideUpgradeScreen());
        document.getElementById('upgrade-after-game').addEventListener('click', () => {
            this.hideGameOver();
            this.showUpgradeScreen();
        });
        document.getElementById('upgrade-coin-rate').addEventListener('click', () => this.upgradeCoinConversion());
        document.getElementById('reroll-chances').addEventListener('click', () => this.rerollChances());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Upgrade button listeners
        document.getElementById('upgrade-food').addEventListener('click', () => this.upgradeFood(1));
        document.getElementById('upgrade-food-multi').addEventListener('click', () => this.upgradeFood(5));
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Update displays
        this.updateScore();
        this.updateCoins();
        this.updateUpgradeDisplays();
        
        // 初始化顯示
        this.draw(); // 只繪製初始畫面，不開始遊戲循環
        
        // 清除所有遊戲數據
        this.clearAllData = () => {
            localStorage.clear();
            this.highScore = 0;
            this.highScoreTitle = '新手';
            this.coins = 0;
            this.coinConversionRate = 1;
            this.scoreMultiplier = 1;
            this.upgradeLevels = {
                normal: 0,
                fast: 0,
                slow: 0,
                bonus: 0
            };
            this.foodTypes.normal.baseChance = 0.6;
            this.foodTypes.fast.baseChance = 0.15;
            this.foodTypes.slow.baseChance = 0.15;
            this.foodTypes.bonus.baseChance = 0.1;
            
            // 更新顯示
            this.updateScore();
            this.updateCoins();
            this.updateUpgradeDisplays();
            alert('所有遊戲數據已清除！');
        };
        
        // 添加清除數據按鈕的事件監聽器
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', this.clearAllData);
        }
        
        // 添加觸控事件監聽器
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // 觸控相關變數
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchThreshold = 30; // 滑動閾值
    }
    
    getFoodPoints(type) {
        const foodType = this.foodTypes[type];
        const level = this.foodUpgradeLevels[type];
        return Math.floor(foodType.basePoints * (1 + level * 0.3));
    }
    
    getFoodChance(type) {
        const foodType = this.foodTypes[type];
        return foodType.baseChance;
    }
    
    getUpgradeCost(type) {
        const level = this.upgradeLevels[type];
        // 使用指數增長計算升級成本
        return Math.floor(50 * Math.pow(1.5, level)); // 基礎50金幣，每級增加50%
    }
    
    getAverageUpgradeCost() {
        const types = ['normal', 'fast', 'slow', 'bonus'];
        let totalCost = 0;
        types.forEach(type => {
            totalCost += this.getUpgradeCost(type);
        });
        return Math.floor(totalCost / types.length);
    }
    
    getCoinConversionCost() {
        // 基礎成本為400，每次升級成本增加60%
        return Math.floor(400 * Math.pow(1.6, this.coinConversionRate - 1));
    }
    
    getScoreMultiplierCost() {
        // 使用1.2倍的指數增長計算升級成本
        return Math.floor(this.baseScoreMultiplierCost * Math.pow(1.2, this.scoreMultiplier - 1));
    }
    
    updateUpgradeDisplays() {
        // 更新金幣轉換率顯示
        document.getElementById('current-coin-rate').textContent = this.coinConversionRate.toFixed(1);
        document.getElementById('next-coin-rate').textContent = (this.coinConversionRate * 1.2).toFixed(1);
        document.getElementById('upgrade-coin-rate').textContent = `升級 (${this.getCoinConversionCost()}金幣)`;
        
        // 更新食物分數顯示
        document.getElementById('normal-food-points').textContent = this.getFoodPoints('normal');
        document.getElementById('fast-food-points').textContent = this.getFoodPoints('fast');
        document.getElementById('slow-food-points').textContent = this.getFoodPoints('slow');
        document.getElementById('bonus-food-points').textContent = this.getFoodPoints('bonus');
        
        // 更新升級按鈕成本
        const singleUpgradeCost = this.calculateFoodUpgradeCost();
        let multiUpgradeCost = 0;
        for (let i = 0; i < 5; i++) {
            multiUpgradeCost += this.calculateFoodUpgradeCost(this.foodUpgradeLevels[Object.keys(this.foodUpgradeLevels)[0]] + i);
        }
        
        document.getElementById('upgrade-food').textContent = `升級食物 (${singleUpgradeCost}金幣)`;
        document.getElementById('upgrade-food-multi').textContent = `升級食物 x5 (${multiUpgradeCost}金幣)`;
        
        // 更新食物機率顯示
        document.getElementById('normal-food-chance').textContent = `${Math.round(this.getFoodChance('normal') * 100)}%`;
        document.getElementById('fast-food-chance').textContent = `${Math.round(this.getFoodChance('fast') * 100)}%`;
        document.getElementById('slow-food-chance').textContent = `${Math.round(this.getFoodChance('slow') * 100)}%`;
        document.getElementById('bonus-food-chance').textContent = `${Math.round(this.getFoodChance('bonus') * 100)}%`;
        
        // 更新金幣顯示
        document.getElementById('upgrade-screen-coins').textContent = this.coins;
        document.getElementById('coin-rate').textContent = this.coinConversionRate.toFixed(1);
    }
    
    upgradeFood(levels = 1) {
        // 計算總成本
        let totalCost = 0;
        for (let i = 0; i < levels; i++) {
            totalCost += this.calculateFoodUpgradeCost(this.foodUpgradeLevels[Object.keys(this.foodUpgradeLevels)[0]] + i);
        }
        
        if (this.coins < totalCost) {
            alert('金幣不足！');
            return;
        }

        // 隨機選擇一種食物進行升級
        const foodTypes = ['normal', 'fast', 'slow', 'bonus'];
        const selectedType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        
        this.foodUpgradeLevels[selectedType] += levels;
        this.coins -= totalCost;
        
        // 更新本地存儲
        localStorage.setItem(`${selectedType}FoodLevel`, this.foodUpgradeLevels[selectedType]);
        localStorage.setItem('snakeCoins', this.coins);
        
        // 更新顯示
        this.updateUpgradeDisplays();
        this.updateCoins();
        
        alert(`成功升級${this.foodTypes[selectedType].colorName}食物 ${levels} 級！`);
    }
    
    calculateFoodUpgradeCost() {
        const normalPoints = this.foodTypes.normal.basePoints * (1 + this.foodUpgradeLevels.normal * 0.1);
        const fastPoints = this.foodTypes.fast.basePoints * (1 + this.foodUpgradeLevels.fast * 0.1);
        const slowPoints = this.foodTypes.slow.basePoints * (1 + this.foodUpgradeLevels.slow * 0.1);
        const bonusPoints = this.foodTypes.bonus.basePoints * (1 + this.foodUpgradeLevels.bonus * 0.1);
        
        // 計算所有食物當前分數的乘積
        const product = normalPoints * fastPoints * slowPoints * bonusPoints;
        // 基礎成本為30，然後根據分數乘積的0.001倍增加
        return Math.floor(30 + product * 0.0001);
    }
    
    showUpgradeScreen() {
        this.upgradeScreen.style.display = 'flex';
        this.updateUpgradeDisplays();
    }
    
    hideUpgradeScreen() {
        this.upgradeScreen.style.display = 'none';
    }
    
    updateCoins() {
        console.log('Updating coins:', this.coins);
        if (this.coinsElement) {
            this.coinsElement.textContent = this.coins;
        }
        localStorage.setItem('snakeCoins', this.coins.toString());
        console.log('Coins after update:', localStorage.getItem('snakeCoins'));
    }
    
    resizeCanvas() {
        const gameArea = document.querySelector('.game-area');
        this.canvas.width = gameArea.clientWidth;
        this.canvas.height = gameArea.clientHeight;
        this.gridSize = Math.min(
            Math.floor(this.canvas.width / 30),
            Math.floor(this.canvas.height / 20)
        );
        this.draw();
    }
    
    startGame() {
        // 確保遊戲完全重置
        this.clearGame();
        
        // 開始新遊戲
        this.gameActive = true;
        this.gameStartTime = Date.now();
        this.updateScore();
        this.generateFood();
        this.gameOverScreen.style.display = 'none';
        this.startBtn.textContent = '重新開始';
        
        // 設置初始遊戲循環
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.update();
            }
        }, this.baseSpeed);
    }
    
    restartGame() {
        // 清理所有計時器
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.speedEffectTimer) {
            clearTimeout(this.speedEffectTimer);
            this.speedEffectTimer = null;
        }
        
        // 重置所有遊戲狀態
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameActive = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        
        // 清除速度狀態顯示
        this.speedStatusElement.textContent = '';
        this.speedStatusElement.className = 'speed-status';
        
        // 設置初始速度
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.update();
            }
        }, this.baseSpeed);
        
        this.updateScore();
        
        // 確保最高分顯示正確
        this.highScoreElement.textContent = this.highScore;
        this.highScoreTitleElement.textContent = this.highScoreTitle;
        
        // 確保金幣相關顯示正確
        this.coinsElement.textContent = this.coins;
        document.getElementById('coin-rate').textContent = this.coinConversionRate;
        
        // 重新繪製畫面
        this.draw();
        
        // 開始新遊戲
        this.startGame();
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? '繼續' : '暫停';
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), this.baseSpeed);
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameActive || this.gamePaused) return;
        
        const key = e.key.toLowerCase();
        const directions = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };
        
        if (directions[key]) {
            const newDirection = directions[key];
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            
            if (opposites[newDirection] !== this.direction) {
                this.nextDirection = newDirection;
            }
        }
    }
    
    update() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.direction = this.nextDirection;
        const head = {...this.snake[0]};
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    eatFood() {
        const foodType = this.foodTypes[this.food.type];
        const points = this.getFoodPoints(this.food.type);
        this.score += points;
        
        // 清除之前的速度效果計時器
        if (this.speedEffectTimer) {
            clearTimeout(this.speedEffectTimer);
            this.speedEffectTimer = null;
            // 恢復到正常速度
            clearInterval(this.gameLoop);
            this.updateScore(); // 使用updateScore來設置正確的速度
            // 清除狀態顯示
            this.speedStatusElement.textContent = '';
            this.speedStatusElement.className = 'speed-status';
        }
        
        // 根據食物類型設置暫時的速度效果
        let speedEffect = 0;
        let statusText = '';
        switch(this.food.type) {
            case 'fast':
                // 根據分數調整加速效果
                let speedReduction = 0;
                if (this.score >= 2000) speedReduction = 50;
                else if (this.score >= 1000) speedReduction = 40;
                else if (this.score >= 500) speedReduction = 30;
                else if (this.score >= 300) speedReduction = 20;
                else if (this.score >= 100) speedReduction = 10;
                
                const currentBaseSpeed = Math.max(50, this.baseSpeed - speedReduction);
                // 加速效果為當前速度的0.4倍
                speedEffect = -Math.floor(currentBaseSpeed * 0.4);
                statusText = '加速中';
                break;
            case 'slow':
                speedEffect = 10; // 減速效果
                statusText = '減速中';
                break;
        }
        
        // 應用速度效果
        if (speedEffect !== 0) {
            // 計算當前基礎速度
            let speedReduction = 0;
            if (this.score >= 2000) speedReduction = 50;
            else if (this.score >= 1000) speedReduction = 40;
            else if (this.score >= 500) speedReduction = 30;
            else if (this.score >= 300) speedReduction = 20;
            else if (this.score >= 100) speedReduction = 10;
            
            const currentBaseSpeed = Math.max(50, this.baseSpeed - speedReduction);
            const effectSpeed = currentBaseSpeed + speedEffect;
            
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                if (this.gameActive && !this.gamePaused) {
                    this.update();
                }
            }, effectSpeed);
            
            // 更新速度狀態顯示
            this.speedStatusElement.textContent = statusText;
            this.speedStatusElement.className = 'speed-status ' + (speedEffect < 0 ? 'fast' : 'slow');
            
            // 設置效果持續時間
            this.speedEffectTimer = setTimeout(() => {
                if (this.gameActive) { // 確保遊戲仍在進行
                    clearInterval(this.gameLoop);
                    // 重新計算當前速度
                    let speedReduction = 0;
                    if (this.score >= 2000) speedReduction = 50;
                    else if (this.score >= 1000) speedReduction = 40;
                    else if (this.score >= 500) speedReduction = 30;
                    else if (this.score >= 300) speedReduction = 20;
                    else if (this.score >= 100) speedReduction = 10;
                    
                    const currentSpeed = Math.max(50, this.baseSpeed - speedReduction);
                    this.gameLoop = setInterval(() => {
                        if (this.gameActive && !this.gamePaused) {
                            this.update();
                        }
                    }, currentSpeed);
                    
                    // 清除狀態顯示
                    this.speedStatusElement.textContent = '';
                    this.speedStatusElement.className = 'speed-status';
                    this.speedEffectTimer = null;
                }
            }, 3000); // 效果持續3秒
        }
        
        this.updateScore();
        this.generateFood();
    }
    
    activatePowerUp() {
        const powerUpType = this.powerUps[this.powerUp.type];
        this.powerUpActive = true;
        this.powerUp = null;
        
        // Apply power-up effects
        switch (this.powerUp.type) {
            case 'shield':
                this.snake.forEach(segment => segment.shielded = true);
                break;
            case 'double':
                this.scoreMultiplier = 2;
                break;
            case 'ghost':
                this.ghostMode = true;
                break;
            case 'length':
                const currentLength = this.snake.length;
                for (let i = 0; i < currentLength; i++) {
                    const newSegment = {...this.snake[this.snake.length - 1]};
                    this.snake.push(newSegment);
                }
                break;
        }
        
        // Set power-up timer if needed
        if (powerUpType.duration > 0) {
            this.powerUpTimer = setTimeout(() => {
                this.deactivatePowerUp();
            }, powerUpType.duration);
        }
    }
    
    deactivatePowerUp() {
        this.powerUpActive = false;
        this.snake.forEach(segment => segment.shielded = false);
        this.scoreMultiplier = 1;
        this.ghostMode = false;
    }
    
    checkCollision(head) {
        // Calculate grid boundaries
        const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
        const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;
        
        // Wall collision
        if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
            return !this.ghostMode;
        }
        
        // Self collision
        if (!this.ghostMode) {
            return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
        }
        
        return false;
    }
    
    generateFood() {
        const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
        const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;
        let newFood;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY),
                type: this.getRandomFoodType()
            };
        } while (
            this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
        );
        
        console.log('Generated food:', newFood.type); // 調試日誌
        this.food = newFood;
    }
    
    generatePowerUp() {
        const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
        const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;
        const types = Object.keys(this.powerUps);
        
        do {
            this.powerUp = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY),
                type: types[Math.floor(Math.random() * types.length)]
            };
        } while (this.snake.some(segment => segment.x === this.powerUp.x && segment.y === this.powerUp.y));
    }
    
    getRandomFoodType() {
        const types = Object.keys(this.foodTypes);
        const chances = types.map(type => this.getFoodChance(type));
        const total = chances.reduce((a, b) => a + b, 0);
        
        // 確保機率總和為1
        const normalizedChances = chances.map(chance => chance / total);
        
        const random = Math.random();
        let sum = 0;
        
        console.log('Food chances:', types.map((type, i) => `${type}: ${normalizedChances[i]} (${Math.round(normalizedChances[i] * 100)}%)`).join(', '));
        console.log('Total chance:', normalizedChances.reduce((a, b) => a + b, 0));
        
        for (let i = 0; i < normalizedChances.length; i++) {
            sum += normalizedChances[i];
            if (random <= sum) {
                console.log('Selected food type:', types[i]);
                return types[i];
            }
        }
        
        return 'normal';
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        const snakeColor = this.getSnakeColor();
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = snakeColor;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });
        
        // Draw food as circle with glow effect
        const foodType = this.foodTypes[this.food.type];
        this.ctx.save();
        this.ctx.shadowColor = foodType.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = foodType.color;
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.gridSize,
            (this.food.y + 0.5) * this.gridSize,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.restore();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // 更新稱號
        let currentTitle = '新手';
        if (this.score >= 2000) currentTitle = '傳奇';
        else if (this.score >= 1000) currentTitle = '大師';
        else if (this.score >= 500) currentTitle = '高手';
        else if (this.score >= 300) currentTitle = '熟練者';
        else if (this.score >= 100) currentTitle = '初學者';
        
        this.titleElement.textContent = currentTitle;
        
        // 更新最高分和稱號
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreTitle = currentTitle;
            this.highScoreElement.textContent = this.highScore;
            this.highScoreTitleElement.textContent = this.highScoreTitle;
            localStorage.setItem('snakeHighScore', this.highScore);
            localStorage.setItem('snakeHighScoreTitle', this.highScoreTitle);
        }
        
        // 根據分數計算當前速度（線性提升）
        let speedReduction = 0;
        if (this.score >= 2000) speedReduction = 50; // 2000分以上
        else if (this.score >= 1000) speedReduction = 40; // 1000-1999分
        else if (this.score >= 500) speedReduction = 30; // 500-999分
        else if (this.score >= 300) speedReduction = 20; // 300-499分
        else if (this.score >= 100) speedReduction = 10; // 100-299分
        
        const currentSpeed = Math.max(50, this.baseSpeed - speedReduction); // 最小速度限制為50
        
        // 如果沒有特殊效果，更新當前速度
        if (!this.speedEffectTimer) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                if (this.gameActive && !this.gamePaused) {
                    this.update();
                }
            }, currentSpeed);
        }
    }
    
    getSnakeColor() {
        let color = this.snakeColors[0];
        for (const [threshold, snakeColor] of Object.entries(this.snakeColors)) {
            if (this.score >= parseInt(threshold)) {
                color = snakeColor;
            }
        }
        return color;
    }
    
    clearGame() {
        // 清理所有計時器
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.speedEffectTimer) {
            clearTimeout(this.speedEffectTimer);
            this.speedEffectTimer = null;
        }
        
        // 重置所有遊戲狀態
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameActive = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        
        // 清除速度狀態顯示
        this.speedStatusElement.textContent = '';
        this.speedStatusElement.className = 'speed-status';
        
        // 設置初始速度
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.update();
            }
        }, this.baseSpeed);
        
        this.updateScore();
        
        // 確保最高分顯示正確
        this.highScoreElement.textContent = this.highScore;
        this.highScoreTitleElement.textContent = this.highScoreTitle;
        
        // 確保金幣相關顯示正確
        this.coinsElement.textContent = this.coins;
        document.getElementById('coin-rate').textContent = this.coinConversionRate;
        
        // 重新繪製畫面
        this.draw();
    }
    
    gameOver() {
        this.gameActive = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.speedEffectTimer) {
            clearTimeout(this.speedEffectTimer);
            this.speedEffectTimer = null;
        }
        
        // 清除速度狀態顯示
        this.speedStatusElement.textContent = '';
        this.speedStatusElement.className = 'speed-status';
        
        this.finalScoreElement.textContent = this.score;
        this.finalTitleElement.textContent = this.titleElement.textContent;
        
        // 計算獲得金幣
        const earnedCoins = Math.floor(this.score * this.coinConversionRate);
        console.log('Earning coins:', earnedCoins, 'from score:', this.score, 'with rate:', this.coinConversionRate); // 調試日誌
        this.coins += earnedCoins;
        console.log('Total coins after game over:', this.coins); // 調試日誌
        this.earnedCoinsElement.textContent = earnedCoins;
        this.updateCoins();
        
        this.gameOverScreen.style.display = 'flex';
    }
    
    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    }
    
    upgradeCoinConversion() {
        const cost = this.getCoinConversionCost();
        console.log('Upgrading coin conversion. Current coins:', this.coins, 'Cost:', cost); // 調試日誌
        if (this.coins >= cost) {
            this.coins -= cost;
            this.coinConversionRate = Math.round((this.coinConversionRate * 1.2) * 10) / 10; // 保留一位小數
            this.coinConversionCost = this.getCoinConversionCost();
            localStorage.setItem('coinConversionRate', this.coinConversionRate.toString());
            this.updateCoins();
            this.updateUpgradeDisplays();
            console.log('After upgrade. Coins:', this.coins, 'New rate:', this.coinConversionRate); // 調試日誌
            alert(`升級成功！現在每1分可以獲得 ${this.coinConversionRate} 金幣`);
        } else {
            alert('金幣不足！');
        }
    }
    
    rerollChances() {
        const cost = 200;
        if (this.coins < cost) {
            alert('金幣不足！');
            return;
        }

        this.coins -= cost;
        
        // 重新分配機率
        const types = ['normal', 'fast', 'slow', 'bonus'];
        let remainingChance = 1;
        
        // 前三種食物各分配10-20%的機率
        for (let i = 1; i < types.length; i++) {
            const minChance = 0.1;
            const maxChance = 0.2;
            const newChance = Math.random() * (maxChance - minChance) + minChance;
            this.foodTypes[types[i]].baseChance = newChance;
            remainingChance -= newChance;
            localStorage.setItem(`${types[i]}Chance`, this.foodTypes[types[i]].baseChance.toString());
        }
        
        // 第一種食物使用剩餘機率
        this.foodTypes[types[0]].baseChance = remainingChance;
        localStorage.setItem(`${types[0]}Chance`, this.foodTypes[types[0]].baseChance.toString());
        
        this.updateCoins();
        this.updateUpgradeDisplays();
        
        alert('機率重新抽取成功！');
    }
    
    upgradeScoreMultiplier() {
        const cost = this.getScoreMultiplierCost();
        console.log('Upgrading score multiplier. Current coins:', this.coins, 'Cost:', cost); // 調試日誌
        if (this.coins >= cost) {
            this.coins -= cost;
            this.scoreMultiplier++;
            this.scoreMultiplierCost = this.getScoreMultiplierCost();
            localStorage.setItem('scoreMultiplier', this.scoreMultiplier.toString());
            this.updateCoins();
            this.updateUpgradeDisplays();
            console.log('After upgrade. Coins:', this.coins, 'New multiplier:', this.scoreMultiplier); // 調試日誌
            alert(`升級成功！現在分數獲得 ${this.scoreMultiplier} 倍`);
        } else {
            alert('金幣不足！');
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
    }
    
    handleTouchEnd() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 判斷滑動方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑動
            if (Math.abs(deltaX) > this.touchThreshold) {
                if (deltaX > 0) {
                    this.nextDirection = 'right';
                } else {
                    this.nextDirection = 'left';
                }
            }
        } else {
            // 垂直滑動
            if (Math.abs(deltaY) > this.touchThreshold) {
                if (deltaY > 0) {
                    this.nextDirection = 'down';
                } else {
                    this.nextDirection = 'up';
                }
            }
        }
    }
}

// Start the game
const game = new SnakeGame(); 