// Game Configuration and Pricing
const PRICING = {
    modules: {
        keyboardControl: { name: 'Keyboard Control', price: 500, memory: 2 },
        mouseControl: { name: 'Mouse Control', price: 400, memory: 1.5 },
        graphics: { name: 'HD Graphics', price: 1500, memory: 8 },
        colorMode: { name: 'Color Mode', price: 900, memory: 3 },
        animations: { name: 'Smooth Animations', price: 800, memory: 3 },
        sounds: { name: 'Sound System', price: 600, memory: 2.5 },
        particles: { name: 'Particle Effects', price: 1200, memory: 4 },
        gameEngine: { name: 'Game Engine (core)', price: 2000, memory: 10, mandatory: true },
        rendering: { name: 'Rendering System', price: 1000, memory: 5, mandatory: true },
        physics: { name: 'Physics Engine', price: 700, memory: 3.5, mandatory: true }
    },
    hourlyRate: 150 // PLN per hour
};

// Game State
const gameState = {
    canvas: null,
    ctx: null,
    player: {
        x: 400,
        y: 300,
        radius: 15,
        color: '#4CAF50',
        velocityX: 0,
        velocityY: 0,
        speed: 5
    },
    keys: {},
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    particles: [],
    features: {
        keyboardControl: true,
        mouseControl: true,
        graphics: true,
        colorMode: true,
        animations: true,
        sounds: true,
        particles: true
    },
    startTime: new Date('2026-01-16T15:00:00').getTime(),
    animationFrame: null
};

// Initialize game
function init() {
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    gameState.canvas.addEventListener('mousemove', handleMouseMove);
    gameState.canvas.addEventListener('click', handleMouseClick);
    
    // Control toggles
    Object.keys(gameState.features).forEach(feature => {
        const checkbox = document.getElementById(feature);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                gameState.features[feature] = e.target.checked;
                updatePricing();
            });
        }
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // Start timer
    setInterval(updateTimer, 1000);
    
    // Start game loop
    updatePricing();
    gameLoop();
}

function resizeCanvas() {
    const container = gameState.canvas.parentElement;
    gameState.canvas.width = container.clientWidth;
    gameState.canvas.height = container.clientHeight;
}

function handleKeyDown(e) {
    if (!gameState.features.keyboardControl) return;
    gameState.keys[e.key] = true;
}

function handleKeyUp(e) {
    if (!gameState.features.keyboardControl) return;
    gameState.keys[e.key] = false;
}

function handleMouseMove(e) {
    if (!gameState.features.mouseControl) return;
    const rect = gameState.canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
}

function handleMouseClick(e) {
    if (!gameState.features.mouseControl) return;
    const rect = gameState.canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
    gameState.mouseClicked = true;
}

function updatePlayer() {
    // Keyboard control
    if (gameState.features.keyboardControl) {
        if (gameState.keys['ArrowUp'] || gameState.keys['w']) {
            gameState.player.velocityY = -gameState.player.speed;
        } else if (gameState.keys['ArrowDown'] || gameState.keys['s']) {
            gameState.player.velocityY = gameState.player.speed;
        } else {
            gameState.player.velocityY = 0;
        }
        
        if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
            gameState.player.velocityX = -gameState.player.speed;
        } else if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
            gameState.player.velocityX = gameState.player.speed;
        } else {
            gameState.player.velocityX = 0;
        }
    }
    
    // Mouse control - move to clicked position
    if (gameState.features.mouseControl && gameState.mouseClicked) {
        const dx = gameState.mouseX - gameState.player.x;
        const dy = gameState.mouseY - gameState.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            gameState.player.velocityX = (dx / distance) * gameState.player.speed;
            gameState.player.velocityY = (dy / distance) * gameState.player.speed;
        } else {
            // Reached destination - stop moving
            gameState.mouseClicked = false;
            gameState.player.velocityX = 0;
            gameState.player.velocityY = 0;
        }
    }
    
    // Apply velocity
    gameState.player.x += gameState.player.velocityX;
    gameState.player.y += gameState.player.velocityY;
    
    // Boundary check
    gameState.player.x = Math.max(gameState.player.radius, Math.min(gameState.canvas.width - gameState.player.radius, gameState.player.x));
    gameState.player.y = Math.max(gameState.player.radius, Math.min(gameState.canvas.height - gameState.player.radius, gameState.player.y));
    
    // Create particles
    if (gameState.features.particles && (Math.abs(gameState.player.velocityX) > 0.1 || Math.abs(gameState.player.velocityY) > 0.1)) {
        createParticle();
    }
}

function createParticle() {
    const particleColor = gameState.features.colorMode 
        ? `hsl(${Math.random() * 60 + 90}, 70%, 60%)` 
        : `hsl(0, 0%, ${Math.random() * 30 + 60}%)`;
    
    gameState.particles.push({
        x: gameState.player.x + (Math.random() - 0.5) * 10,
        y: gameState.player.y + (Math.random() - 0.5) * 10,
        radius: Math.random() * 3 + 1,
        color: particleColor,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: (Math.random() - 0.5) * 2,
        life: 1
    });
}

function updateParticles() {
    if (!gameState.features.particles) {
        gameState.particles = [];
        return;
    }
    
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.life -= 0.02;
        p.radius *= 0.95;
        
        if (p.life <= 0 || p.radius < 0.5) {
            gameState.particles.splice(i, 1);
        }
    }
}

function render() {
    const ctx = gameState.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Draw grid (if graphics enabled)
    if (gameState.features.graphics) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < gameState.canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gameState.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < gameState.canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gameState.canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Draw particles
    if (gameState.features.particles) {
        gameState.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    // Draw player
    if (gameState.features.graphics) {
        // Draw glow effect
        const glowColor = gameState.features.colorMode 
            ? 'rgba(76, 175, 80, 0.8)' 
            : 'rgba(200, 200, 200, 0.8)';
        const glowColorEnd = gameState.features.colorMode 
            ? 'rgba(76, 175, 80, 0)' 
            : 'rgba(200, 200, 200, 0)';
        
        const gradient = ctx.createRadialGradient(
            gameState.player.x, gameState.player.y, 0,
            gameState.player.x, gameState.player.y, gameState.player.radius * 2
        );
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, glowColorEnd);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(gameState.player.x, gameState.player.y, gameState.player.radius * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw main player circle
    ctx.fillStyle = gameState.features.colorMode ? gameState.player.color : '#CCCCCC';
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, gameState.player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (gameState.features.graphics) {
        ctx.strokeStyle = gameState.features.colorMode ? '#8FFF8F' : '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw info text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`Position: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})`, 10, 20);
    
    if (gameState.features.keyboardControl) {
        ctx.fillText('Arrows: ← → ↑ ↓', 10, 40);
    }
    if (gameState.features.mouseControl) {
        ctx.fillText('Mouse: click to move', 10, 60);
    }
}

function gameLoop() {
    updatePlayer();
    updateParticles();
    render();
    
    if (gameState.features.animations) {
        gameState.animationFrame = requestAnimationFrame(gameLoop);
    } else {
        setTimeout(() => {
            gameState.animationFrame = requestAnimationFrame(gameLoop);
        }, 100);
    }
}

function resetGame() {
    gameState.player.x = gameState.canvas.width / 2;
    gameState.player.y = gameState.canvas.height / 2;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.particles = [];
    gameState.keys = {};
}

function updateTimer() {
    const elapsed = Date.now() - gameState.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
    
    updatePricing();
}

function updatePricing() {
    const pricingList = document.getElementById('pricingList');
    pricingList.innerHTML = '';
    
    let totalModuleCost = 0;
    let totalMemory = 0;
    
    // Add all modules to pricing
    Object.entries(PRICING.modules).forEach(([key, module]) => {
        const isActive = gameState.features[key] !== undefined ? gameState.features[key] : true;
        const isMandatory = module.mandatory || false;
        
        if (isActive || isMandatory) {
            totalModuleCost += module.price;
            totalMemory += module.memory;
        }
        
        const item = document.createElement('div');
        item.className = 'pricing-item';
        
        const status = (isActive || isMandatory) ? 'status-active' : 'status-inactive';
        const statusText = (isActive || isMandatory) ? '✓' : '✗';
        
        item.innerHTML = `
            <div class="pricing-item-header">
                <span class="${status}">${statusText} ${module.name}</span>
                <span class="${status}">${module.price} PLN</span>
            </div>
            <div class="pricing-item-detail">
                Memory: ${module.memory} KB ${isMandatory ? '(required)' : ''}
            </div>
        `;
        
        pricingList.appendChild(item);
    });
    
    // Calculate time cost
    const elapsed = Date.now() - gameState.startTime;
    const hours = elapsed / 3600000;
    const timeCost = Math.round(hours * PRICING.hourlyRate);
    
    // Update summary
    document.getElementById('moduleCost').textContent = `${totalModuleCost} PLN`;
    document.getElementById('memorySize').textContent = `${totalMemory.toFixed(1)} KB`;
    document.getElementById('workTime').textContent = `${timeCost} PLN (${hours.toFixed(2)}h × ${PRICING.hourlyRate} PLN/h)`;
    document.getElementById('totalCost').textContent = `${totalModuleCost + timeCost} PLN`;
}

// Start game when page loads
window.addEventListener('load', init);
