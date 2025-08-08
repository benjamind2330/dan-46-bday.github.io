class MetallicaMinecraftRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start';
        this.backgroundMusic = document.getElementById('backgroundMusic');
        
        this.player = {
            x: 100,
            y: 280,
            width: 32,
            height: 32,
            velocityY: 0,
            jumping: false,
            grounded: true
        };
        
        this.obstacles = [];
        this.collectibles = [];
        this.score = 0;
        this.gameSpeed = 2;
        this.lastObstacleTime = 0;
        this.lastCollectibleTime = 0;
        
        this.keys = {};
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.collectibles = [];
        this.player.x = 100;
        this.player.y = 280;
        this.player.velocityY = 0;
        this.player.grounded = true;
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('scoreValue').textContent = '0';
        this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
    }
    
    jump() {
        if (this.gameState === 'playing' && this.player.grounded) {
            this.player.velocityY = -12;
            this.player.jumping = true;
            this.player.grounded = false;
        }
    }
    
    updatePlayer() {
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= 3;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += 3;
        }
        
        this.player.velocityY += 0.6;
        this.player.y += this.player.velocityY;
        
        const groundY = 280;
        if (this.player.y >= groundY) {
            this.player.y = groundY;
            this.player.velocityY = 0;
            this.player.jumping = false;
            this.player.grounded = true;
        }
    }
    
    spawnObstacle() {
        const now = Date.now();
        if (now - this.lastObstacleTime > 2000 - (this.gameSpeed * 100)) {
            const types = ['creeper', 'tnt', 'lava'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.obstacles.push({
                x: this.canvas.width,
                y: type === 'lava' ? 312 : 280,
                width: 32,
                height: type === 'lava' ? 32 : 32,
                type: type
            });
            
            this.lastObstacleTime = now;
        }
    }
    
    spawnCollectible() {
        const now = Date.now();
        if (now - this.lastCollectibleTime > 3000) {
            const types = ['guitar', 'note'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.collectibles.push({
                x: this.canvas.width,
                y: Math.random() > 0.5 ? 200 : 250,
                width: 24,
                height: 24,
                type: type
            });
            
            this.lastCollectibleTime = now;
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.gameSpeed;
            
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateCollectibles() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            this.collectibles[i].x -= this.gameSpeed;
            
            if (this.collectibles[i].x + this.collectibles[i].width < 0) {
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.collectibles[i])) {
                const points = this.collectibles[i].type === 'guitar' ? 100 : 50;
                this.score += points;
                this.collectibles.splice(i, 1);
                document.getElementById('scoreValue').textContent = this.score;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    updateGameSpeed() {
        if (this.score > 0 && this.score % 500 === 0) {
            this.gameSpeed += 0.1;
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 8, this.player.y + 8, 4, 4);
        this.ctx.fillRect(this.player.x + 20, this.player.y + 8, 4, 4);
        
        this.ctx.fillStyle = '#FF6B00';
        this.ctx.fillRect(this.player.x + 12, this.player.y + 20, 8, 4);
        
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 4, 24, 8);
    }
    
    drawObstacles() {
        for (let obstacle of this.obstacles) {
            switch (obstacle.type) {
                case 'creeper':
                    this.ctx.fillStyle = '#00FF00';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(obstacle.x + 8, obstacle.y + 8, 4, 4);
                    this.ctx.fillRect(obstacle.x + 20, obstacle.y + 8, 4, 4);
                    this.ctx.fillRect(obstacle.x + 12, obstacle.y + 16, 8, 8);
                    break;
                case 'tnt':
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.font = '12px monospace';
                    this.ctx.fillText('TNT', obstacle.x + 4, obstacle.y + 20);
                    break;
                case 'lava':
                    this.ctx.fillStyle = '#FF4500';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.fillStyle = '#FF6B00';
                    for (let i = 0; i < 3; i++) {
                        this.ctx.fillRect(obstacle.x + i * 8, obstacle.y + Math.sin(Date.now() * 0.01 + i) * 4, 8, 8);
                    }
                    break;
            }
        }
    }
    
    drawCollectibles() {
        for (let collectible of this.collectibles) {
            switch (collectible.type) {
                case 'guitar':
                    this.ctx.fillStyle = '#8B4513';
                    this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(collectible.x + 8, collectible.y + 4, 8, 16);
                    this.ctx.fillStyle = '#C0C0C0';
                    for (let i = 0; i < 6; i++) {
                        this.ctx.fillRect(collectible.x + 10 + i, collectible.y + 6, 1, 12);
                    }
                    break;
                case 'note':
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.beginPath();
                    this.ctx.arc(collectible.x + 12, collectible.y + 12, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = '16px monospace';
                    this.ctx.fillText('♪', collectible.x + 8, collectible.y + 16);
                    break;
            }
        }
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, 200);
        
        this.ctx.fillStyle = '#98FB98';
        this.ctx.fillRect(0, 200, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 300, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < this.canvas.width; i += 16) {
            this.ctx.fillRect(i, 296, 16, 4);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            this.drawBackground();
            this.drawPlayer();
            this.drawObstacles();
            this.drawCollectibles();
        }
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.updatePlayer();
            this.spawnObstacle();
            this.spawnCollectible();
            this.updateObstacles();
            this.updateCollectibles();
            this.checkCollisions();
            this.updateGameSpeed();
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new MetallicaMinecraftRunner();
});