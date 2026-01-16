// Game Configuration and Pricing
const PRICING = {
    modules: {
        keyboardControl: { name: 'Keyboard Control', price: 116, memory: 2 },
        mouseControl: { name: 'Mouse Control', price: 93, memory: 1.5 },
        autofollow: { name: 'Autofollow Mouse', price: 93, memory: 1.5 },
        graphics: { name: 'HD Graphics', price: 349, memory: 8 },
        colorMode: { name: 'Color Mode', price: 209, memory: 3 },
        animations: { name: 'Smooth Animations', price: 186, memory: 3 },
        sounds: { name: 'Sound System', price: 140, memory: 2.5 },
        particles: { name: 'Particle Effects', price: 279, memory: 4 },
        tips: { name: 'Tips Display', price: 81, memory: 1 },
        debugConsole: { name: 'Debug Console', price: 70, memory: 0.8 },
        healthBar: { name: 'Health Bar', price: 105, memory: 1.5 },
        gameEngine: { name: 'Game Engine (core)', price: 465, memory: 10, mandatory: true },
        rendering: { name: 'Rendering System', price: 233, memory: 5, mandatory: true },
        physics: { name: 'Physics Engine', price: 163, memory: 3.5, mandatory: true }
    },
    hourlyRate: 35, // EUR per hour (150 PLN / 4.30)
    promptRate: 0.25, // EUR per prompt (increased from 0.035)
    totalPrompts: 26 // Updated: added this prompt about AI prompts price change
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
        speed: 5,
        health: 100,
        maxHealth: 100
    },
    keys: {},
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    targetX: 0,
    targetY: 0,
    particles: [],
    features: {
        keyboardControl: true,
        mouseControl: true,
        autofollow: false,
        graphics: true,
        colorMode: true,
        animations: true,
        sounds: true,
        particles: true,
        tips: true,
        debugConsole: false,
        healthBar: true
    },
    moduleTimeTracking: {}, // Track time each module is enabled
    gameStartTime: null, // When game actually starts (RESTART pressed)
    gameRunning: false,
    lastUpdateTime: null,
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
    
    // Start timer - update every 100ms for smooth price growth
    setInterval(updateTimer, 100);
    
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
    // Show cost summary on Q key
    if (e.key === 'q' || e.key === 'Q') {
        showCostSummary();
        return;
    }
    
    if (!gameState.features.keyboardControl) return;
    gameState.keys[e.key] = true;
}

function handleKeyUp(e) {
    if (!gameState.features.keyboardControl) return;
    gameState.keys[e.key] = false;
}

function handleMouseMove(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
}

function handleMouseClick(e) {
    if (!gameState.features.mouseControl) return;
    const rect = gameState.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // Save target position for mouse control
    gameState.targetX = clickX;
    gameState.targetY = clickY;
    gameState.mouseClicked = true;
}

function updatePlayer() {
    // Check if keyboard is actively being used
    const keyboardActive = gameState.features.keyboardControl && (
        gameState.keys['ArrowUp'] || gameState.keys['w'] ||
        gameState.keys['ArrowDown'] || gameState.keys['s'] ||
        gameState.keys['ArrowLeft'] || gameState.keys['a'] ||
        gameState.keys['ArrowRight'] || gameState.keys['d']
    );
    
    // Keyboard control (highest priority)
    if (gameState.features.keyboardControl) {
        if (gameState.keys['ArrowUp'] || gameState.keys['w']) {
            gameState.player.velocityY = -gameState.player.speed;
        } else if (gameState.keys['ArrowDown'] || gameState.keys['s']) {
            gameState.player.velocityY = gameState.player.speed;
        } else if (!keyboardActive) {
            gameState.player.velocityY = 0;
        }
        
        if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
            gameState.player.velocityX = -gameState.player.speed;
        } else if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
            gameState.player.velocityX = gameState.player.speed;
        } else if (!keyboardActive) {
            gameState.player.velocityX = 0;
        }
    }
    
    // Mouse controls only work if keyboard is NOT being used
    if (!keyboardActive) {
        // Autofollow mouse - continuously follow cursor
        if (gameState.features.autofollow && (gameState.mouseX > 0 || gameState.mouseY > 0)) {
            const dx = gameState.mouseX - gameState.player.x;
            const dy = gameState.mouseY - gameState.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                gameState.player.velocityX = (dx / distance) * gameState.player.speed * 0.1;
                gameState.player.velocityY = (dy / distance) * gameState.player.speed * 0.1;
            }
        }
        // Mouse control - move to clicked position (only if autofollow is disabled)
        else if (gameState.features.mouseControl && gameState.mouseClicked) {
            const dx = gameState.targetX - gameState.player.x;
            const dy = gameState.targetY - gameState.player.y;
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
    
    // Draw health bar
    if (gameState.features.healthBar) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = gameState.canvas.width - barWidth - 10;
        const barY = 10;
        
        // Background (gray)
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health (green or grayscale)
        const healthPercent = gameState.player.health / gameState.player.maxHealth;
        const healthColor = gameState.features.colorMode ? '#4CAF50' : '#CCCCCC';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = gameState.features.colorMode ? '#8FFF8F' : '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`HP: ${gameState.player.health}/${gameState.player.maxHealth}`, barX + barWidth / 2, barY + 14);
        ctx.textAlign = 'left';
    }
    
    // Draw info text (Tips)
    if (gameState.features.tips) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        
        if (gameState.features.keyboardControl) {
            ctx.fillText('Arrows: ← → ↑ ↓', 10, 20);
        }
        if (gameState.features.autofollow) {
            ctx.fillText('Mouse: follows cursor', 10, 40);
        } else if (gameState.features.mouseControl) {
            ctx.fillText('Mouse: click to move', 10, 40);
        }
    }
    
    // Draw Debug Console (bottom left)
    if (gameState.features.debugConsole) {
        const debugX = 10;
        const debugY = gameState.canvas.height - 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(debugX - 5, debugY - 65, 250, 70);
        
        ctx.fillStyle = gameState.features.colorMode ? '#00FF00' : '#CCCCCC';
        ctx.font = '12px Courier New';
        ctx.fillText(`DEBUG CONSOLE`, debugX, debugY - 50);
        ctx.fillText(`Position: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})`, debugX, debugY - 35);
        ctx.fillText(`Velocity: (${gameState.player.velocityX.toFixed(2)}, ${gameState.player.velocityY.toFixed(2)})`, debugX, debugY - 20);
        ctx.fillText(`FPS: ${Math.round(1000 / 16)}`, debugX, debugY - 5);
    }
}


function gameLoop() {
    updateModuleTimeTracking();
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
    
    // Initialize game tracking
    gameState.gameStartTime = Date.now();
    gameState.gameRunning = true;
    gameState.lastUpdateTime = Date.now();
    
    // Initialize time tracking for all modules
    gameState.moduleTimeTracking = {};
    Object.keys(PRICING.modules).forEach(key => {
        gameState.moduleTimeTracking[key] = 0; // seconds
    });
}

function updateModuleTimeTracking() {
    if (!gameState.gameRunning) return;
    
    const now = Date.now();
    const deltaSeconds = (now - gameState.lastUpdateTime) / 1000;
    gameState.lastUpdateTime = now;
    
    // Add time for each currently enabled module
    Object.keys(PRICING.modules).forEach(key => {
        const isActive = gameState.features[key] !== undefined ? gameState.features[key] : true;
        const isMandatory = PRICING.modules[key].mandatory || false;
        
        if (isActive || isMandatory) {
            gameState.moduleTimeTracking[key] += deltaSeconds;
        }
    });
}

function resetGame() {
    gameState.player.x = gameState.canvas.width / 2;
    gameState.player.y = gameState.canvas.height / 2;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.particles = [];
    gameState.keys = {};
    
    // Reset and start game tracking
    gameState.gameStartTime = Date.now();
    gameState.gameRunning = true;
    gameState.lastUpdateTime = Date.now();
    
    // Reset time tracking for all modules
    gameState.moduleTimeTracking = {};
    Object.keys(PRICING.modules).forEach(key => {
        gameState.moduleTimeTracking[key] = 0;
    });
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
    let activeModuleCount = 0;
    const totalModules = Object.keys(PRICING.modules).length;
    
    // Add all modules to pricing
    Object.entries(PRICING.modules).forEach(([key, module]) => {
        const isActive = gameState.features[key] !== undefined ? gameState.features[key] : true;
        const isMandatory = module.mandatory || false;
        
        if (isActive || isMandatory) {
            totalModuleCost += module.price;
            totalMemory += module.memory;
            activeModuleCount++;
        }
        
        const item = document.createElement('div');
        item.className = 'pricing-item';
        
        const status = (isActive || isMandatory) ? 'status-active' : 'status-inactive';
        const statusText = (isActive || isMandatory) ? '✓' : '✗';
        
        item.innerHTML = `
            <div class="pricing-item-header">
                <span class="${status}">${statusText} ${module.name}</span>
                <span class="${status}">${module.price.toFixed(2)} EUR</span>
            </div>
            <div class="pricing-item-detail">
                Memory: ${module.memory.toFixed(2)} KB ${isMandatory ? '(required)' : ''}
            </div>
        `;
        
        pricingList.appendChild(item);
    });
    
    // Calculate time cost
    const elapsed = Date.now() - gameState.startTime;
    const hours = elapsed / 3600000;
    const timeCost = hours * PRICING.hourlyRate; // Remove Math.round for precise display
    
    // Calculate prompt cost
    const promptCost = PRICING.totalPrompts * PRICING.promptRate;
    
    // Calculate average memory cost per active module
    const avgMemoryPerModule = activeModuleCount > 0 ? (totalMemory / activeModuleCount).toFixed(2) : 0;
    
    // Calculate subtotal (before margin)
    const subtotal = totalModuleCost + timeCost + promptCost;
    
    // Calculate margin (10% of subtotal)
    const marginRate = 0.10;
    const marginCost = subtotal * marginRate;
    
    // Calculate final total (subtotal + margin)
    const finalTotal = subtotal + marginCost;
    
    // Update summary
    document.getElementById('memorySize').textContent = `${avgMemoryPerModule} KB/mod - ${totalMemory.toFixed(2)} KB`;
    document.getElementById('moduleCost').textContent = `${activeModuleCount}/${totalModules} - ${totalModuleCost.toFixed(2)} EUR`;
    document.getElementById('workTime').textContent = `(${hours.toFixed(2)}h × ${PRICING.hourlyRate} EUR/h) ${timeCost.toFixed(2)} EUR`;
    document.getElementById('promptCost').textContent = `(${PRICING.totalPrompts} × ${PRICING.promptRate} EUR) ${promptCost.toFixed(2)} EUR`;
    document.getElementById('marginCost').textContent = `${marginCost.toFixed(2)} EUR`;
    document.getElementById('totalCost').textContent = `${finalTotal.toFixed(2)} EUR`;
}

function showCostSummary() {
    if (!gameState.gameRunning) {
        alert('Game not started! Press RESTART GAME to begin.');
        return;
    }
    
    const gameTimeSeconds = (Date.now() - gameState.gameStartTime) / 1000;
    const gameTimeMinutes = gameTimeSeconds / 60;
    
    let summary = '=== CURRENT GAME COST ===\n\n';
    summary += `Game Time: ${Math.floor(gameTimeMinutes)}m ${Math.floor(gameTimeSeconds % 60)}s\n\n`;
    summary += 'MODULE COSTS (time-based):\n';
    
    let moduleCost = 0;
    Object.entries(PRICING.modules).forEach(([key, module]) => {
        const timeUsed = gameState.moduleTimeTracking[key] || 0;
        const percentUsed = gameTimeSeconds > 0 ? (timeUsed / gameTimeSeconds) : 0;
        const cost = module.price * percentUsed;
        moduleCost += cost;
        
        if (timeUsed > 0) {
            summary += `${module.name}: ${timeUsed.toFixed(1)}s (${(percentUsed * 100).toFixed(0)}%) = ${cost.toFixed(2)} EUR\n`;
        }
    });
    
    const workTimeCost = (gameTimeMinutes / 60) * PRICING.hourlyRate;
    const promptCost = PRICING.totalPrompts * PRICING.promptRate;
    const subtotal = moduleCost + workTimeCost + promptCost;
    const marginCost = subtotal * 0.10;
    const total = subtotal + marginCost;
    
    summary += `\nWork Time: ${(gameTimeMinutes / 60).toFixed(4)}h × ${PRICING.hourlyRate} EUR/h = ${workTimeCost.toFixed(2)} EUR\n`;
    summary += `AI Prompts: ${PRICING.totalPrompts} × ${PRICING.promptRate} EUR = ${promptCost.toFixed(2)} EUR\n`;
    summary += `\nSubtotal: ${subtotal.toFixed(2)} EUR\n`;
    summary += `Margin (10%): ${marginCost.toFixed(2)} EUR\n`;
    summary += `\n=== TOTAL: ${total.toFixed(2)} EUR ===`;
    
    alert(summary);
}

// Start game when page loads
window.addEventListener('load', init);
