// Game Configuration and Pricing
const PRICING = {
    modules: {
        keyboardControl: { name: 'Keyboard Control', price: 174, memory: 2 },
        mouseControl: { name: 'Mouse Control', price: 107, memory: 1.5 },
        autofollow: { name: 'Autofollow Mouse', price: 107, memory: 1.5 },
        graphics: { name: 'HD Graphics', price: 231, memory: 10 },
        colorMode: { name: 'Color Mode', price: 69, memory: 3 },
        animations: { name: 'Smooth Animations', price: 215, memory: 3 },
        sounds: { name: 'Sound System', price: 162, memory: 2.5 },
        particles: { name: 'Particle Effects', price: 174, memory: 4 },
        tips: { name: 'Tips Display', price: 57, memory: 1.3 },
        debugConsole: { name: 'Debug Console', price: 104, memory: 1.2 },
        healthBar: { name: 'Health Bar', price: 121, memory: 1.5 },
        walls: { name: 'Walls', price: 92, memory: 3 },
        wallCollision: { name: 'Wall Collision', price: 208, memory: 3 },
        gameEngine: { name: 'Game Engine (core)', price: 539, memory: 10, mandatory: true },
        rendering: { name: 'Rendering System', price: 270, memory: 8, mandatory: true },
        physics: { name: 'Physics Engine', price: 189, memory: 3.5, mandatory: true }
    },
    dimensions: {
        '1d': { name: '1D Mode', price: 1, memory: 0.1 },
        '2d': { name: '2D Mode', price: 927, memory: 6 },
        '3d': { name: '3D Mode', price: 1392, memory: 8 }
    },
    hourlyRate: 40, // USD per hour (150 PLN / 4.30)
    promptRate: 0.29, // USD per prompt (increased from 0.035)
    funTimeRate: 0.29, // USD per minute - premium fun time!
    energyHourlyRate: 7, // USD per hour - electricity cost (0.10 USD/min × 60)
    totalPrompts: 44 // All user messages across both sessions (26 previous + 18 current)
};

// Raycasting Configuration
const RAYCASTING = {
    fov: 60,
    numRays: 60,
    maxDepth: 800,
    wallHeight: 600
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
        angle: 0,      // Kat patrzenia (0-360 stopni)
        fov: 60,       // Field of view
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
    dimension: '1d', // Current dimension
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
        healthBar: true,
        walls: true,
        wallCollision: true
    },
    walls: [
        // Outer walls
        { x: 0, y: 0, width: 1600, height: 20 },        // Top
        { x: 0, y: 1180, width: 1600, height: 20 },     // Bottom
        { x: 0, y: 0, width: 20, height: 1200 },        // Left
        { x: 1580, y: 0, width: 20, height: 1200 },     // Right
        
        // Vertical divider (middle) - with 2 doors
        { x: 790, y: 0, width: 20, height: 300 },       // Top part
        { x: 790, y: 400, width: 20, height: 300 },     // Middle part
        { x: 790, y: 800, width: 20, height: 400 },     // Bottom part
        // Doors at y=300-400 and y=700-800
        
        // Horizontal divider (middle) - with 2 doors
        { x: 0, y: 590, width: 300, height: 20 },       // Left part
        { x: 400, y: 590, width: 300, height: 20 },     // Middle-left part
        { x: 800, y: 590, width: 300, height: 20 },     // Middle-right part
        { x: 1200, y: 590, width: 400, height: 20 }     // Right part
        // Doors at x=300-400 and x=1100-1200
    ],
    startTime: new Date('2026-01-16T15:00:00').getTime(),
    funStartTime: Date.now(), // Fun time starts when page loads!
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
                gameState.canvas.focus(); // Return focus to game
            });
        }
    });
    
    // Dimension selector listeners
    ['dim1d', 'dim2d', 'dim3d'].forEach(dimId => {
        const radio = document.getElementById(dimId);
        if (radio) {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    gameState.dimension = e.target.value;
                    updatePricing();
                    gameState.canvas.focus(); // Return focus to game
                }
            });
        }
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        resetGame();
        gameState.canvas.focus(); // Return focus to game
    });
    
    // Buy button - opens GitHub Sponsors with fixed $1
    document.getElementById('buyBtn').addEventListener('click', function() {
        const sponsorUrl = `https://github.com/sponsors/michalstankiewicz4-cell/sponsorships?amount=1&email_opt_in=off&frequency=one-time&privacy_level=public&sponsor=michalstankiewicz4-cell`;
        window.open(sponsorUrl, '_blank');
        gameState.canvas.focus(); // Return focus to game
    });
    
    // Start timer - update every 100ms for smooth price growth
    setInterval(updateTimer, 100);
    
    // Focus canvas by default (so arrows control game, not UI)
    gameState.canvas.focus();
    
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
    const rect = gameState.canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
}

function checkCircleRectCollision(circleX, circleY, circleRadius, rect) {
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));
    
    // Calculate distance from circle center to this closest point
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    // Collision if distance is less than circle radius
    return distanceSquared < (circleRadius * circleRadius);
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
    // 2D FPS mode - different controls
    if (gameState.dimension === '2d' && gameState.features.keyboardControl) {
        const rotationSpeed = 3; // degrees per frame
        const moveSpeed = 4;
        
        // Rotate camera
        if (gameState.keys['ArrowLeft']) {
            gameState.player.angle -= rotationSpeed;
            if (gameState.player.angle < 0) gameState.player.angle += 360;
        }
        if (gameState.keys['ArrowRight']) {
            gameState.player.angle += rotationSpeed;
            if (gameState.player.angle >= 360) gameState.player.angle -= 360;
        }
        
        // Move forward/backward
        const rad = gameState.player.angle * Math.PI / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);
        
        if (gameState.keys['ArrowUp']) {
            gameState.player.velocityX = dirX * moveSpeed;
            gameState.player.velocityY = dirY * moveSpeed;
        } else if (gameState.keys['ArrowDown']) {
            gameState.player.velocityX = -dirX * moveSpeed;
            gameState.player.velocityY = -dirY * moveSpeed;
        } else {
            gameState.player.velocityX = 0;
            gameState.player.velocityY = 0;
        }
        
        // Apply movement with collision
        const newX = gameState.player.x + gameState.player.velocityX;
        const newY = gameState.player.y + gameState.player.velocityY;
        
        if (gameState.features.wallCollision && gameState.features.walls) {
            let collisionX = false;
            let collisionY = false;
            
            gameState.walls.forEach(wall => {
                if (newX >= wall.x && newX <= wall.x + wall.width &&
                    gameState.player.y >= wall.y && gameState.player.y <= wall.y + wall.height) {
                    collisionX = true;
                }
                if (gameState.player.x >= wall.x && gameState.player.x <= wall.x + wall.width &&
                    newY >= wall.y && newY <= wall.y + wall.height) {
                    collisionY = true;
                }
            });
            
            if (!collisionX) gameState.player.x = newX;
            if (!collisionY) gameState.player.y = newY;
        } else {
            gameState.player.x = newX;
            gameState.player.y = newY;
        }
        
        // Boundary check
        gameState.player.x = Math.max(gameState.player.radius, Math.min(gameState.canvas.width - gameState.player.radius, gameState.player.x));
        gameState.player.y = Math.max(gameState.player.radius, Math.min(gameState.canvas.height - gameState.player.radius, gameState.player.y));
        
        return; // Exit early - 2D mode handled
    }
    
    // 1D mode - original top-down controls
    // Check if keyboard is actively being used
    const keyboardActive = gameState.features.keyboardControl && (
        gameState.keys['ArrowUp'] ||
        gameState.keys['ArrowDown'] ||
        gameState.keys['ArrowLeft'] ||
        gameState.keys['ArrowRight']
    );
    
    // Keyboard control (highest priority)
    if (gameState.features.keyboardControl) {
        if (gameState.keys['ArrowUp']) {
            gameState.player.velocityY = -gameState.player.speed;
        } else if (gameState.keys['ArrowDown']) {
            gameState.player.velocityY = gameState.player.speed;
        } else if (!keyboardActive) {
            gameState.player.velocityY = 0;
        }
        
        if (gameState.keys['ArrowLeft']) {
            gameState.player.velocityX = -gameState.player.speed;
        } else if (gameState.keys['ArrowRight']) {
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
    
    // Calculate new position
    const newX = gameState.player.x + gameState.player.velocityX;
    const newY = gameState.player.y + gameState.player.velocityY;
    
    // Check wall collision if enabled
    if (gameState.features.wallCollision && gameState.features.walls) {
        let collisionX = false;
        let collisionY = false;
        
        gameState.walls.forEach(wall => {
            // Check X-axis collision
            if (checkCircleRectCollision(newX, gameState.player.y, gameState.player.radius, wall)) {
                collisionX = true;
            }
            // Check Y-axis collision
            if (checkCircleRectCollision(gameState.player.x, newY, gameState.player.radius, wall)) {
                collisionY = true;
            }
        });
        
        // Apply velocity only if no collision
        if (!collisionX) {
            gameState.player.x = newX;
        }
        if (!collisionY) {
            gameState.player.y = newY;
        }
    } else {
        // No collision check - apply velocity normally
        gameState.player.x = newX;
        gameState.player.y = newY;
    }
    
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

// Raycasting - rzuc jeden promien
function castRay(startX, startY, angle) {
    const rad = angle * Math.PI / 180;
    const dirX = Math.cos(rad);
    const dirY = Math.sin(rad);
    
    let distance = 0;
    const step = 2;
    
    while (distance < RAYCASTING.maxDepth) {
        distance += step;
        const checkX = startX + dirX * distance;
        const checkY = startY + dirY * distance;
        
        if (gameState.features.walls) {
            for (let wall of gameState.walls) {
                if (checkX >= wall.x && checkX <= wall.x + wall.width &&
                    checkY >= wall.y && checkY <= wall.y + wall.height) {
                    return { distance, hitWall: true };
                }
            }
        }
    }
    
    return { distance: RAYCASTING.maxDepth, hitWall: false };
}

// Render 2D mode (Wolfenstein style)
function render2DMode() {
    const ctx = gameState.ctx;
    const width = gameState.canvas.width;
    const height = gameState.canvas.height;
    
    // Podloga (ciemny gradient)
    const floorGradient = ctx.createLinearGradient(0, height / 2, 0, height);
    floorGradient.addColorStop(0, '#1a1a1a');
    floorGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, height / 2, width, height / 2);
    
    // Sufit (jasny gradient)
    const ceilingGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    ceilingGradient.addColorStop(0, '#2a2a2a');
    ceilingGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = ceilingGradient;
    ctx.fillRect(0, 0, width, height / 2);
    
    // Raycasting
    const startAngle = gameState.player.angle - RAYCASTING.fov / 2;
    const columnWidth = width / RAYCASTING.numRays;
    
    for (let i = 0; i < RAYCASTING.numRays; i++) {
        const rayAngle = startAngle + (i * RAYCASTING.fov / RAYCASTING.numRays);
        const ray = castRay(gameState.player.x, gameState.player.y, rayAngle);
        
        if (ray.hitWall) {
            const angleDiff = rayAngle - gameState.player.angle;
            const correctedDistance = ray.distance * Math.cos(angleDiff * Math.PI / 180);
            
            const wallHeight = (RAYCASTING.wallHeight / correctedDistance) * 277;
            const wallTop = (height / 2) - (wallHeight / 2);
            
            const brightness = Math.max(0, 1 - (correctedDistance / RAYCASTING.maxDepth));
            const wallColor = gameState.features.colorMode 
                ? `rgba(76, 175, 80, ${brightness})` 
                : `rgba(200, 200, 200, ${brightness})`;
            
            ctx.fillStyle = wallColor;
            ctx.fillRect(i * columnWidth, wallTop, columnWidth + 1, wallHeight);
        }
    }
}

// Helper: Draw Health Bar
function drawHealthBar() {
    const ctx = gameState.ctx;
    const barWidth = 200;
    const barHeight = 20;
    const barX = gameState.canvas.width - barWidth - 10;
    const barY = 10;
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const healthPercent = gameState.player.health / gameState.player.maxHealth;
    const healthColor = gameState.features.colorMode ? '#4CAF50' : '#CCCCCC';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    ctx.strokeStyle = gameState.features.colorMode ? '#8FFF8F' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${gameState.player.health}/${gameState.player.maxHealth}`, barX + barWidth / 2, barY + 14);
    ctx.textAlign = 'left';
}

// Helper: Draw Tips
function drawTips() {
    const ctx = gameState.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    
    if (gameState.dimension === '2d') {
        ctx.fillText('Arrows: Rotate and Move (FPS)', 10, 20);
        if (gameState.features.mouseControl) {
            ctx.fillText('Mouse: click to move', 10, 40);
        }
    } else {
        if (gameState.features.keyboardControl) {
            ctx.fillText('Arrows: Move', 10, 20);
        }
        if (gameState.features.autofollow) {
            ctx.fillText('Mouse: follows cursor', 10, 40);
        } else if (gameState.features.mouseControl) {
            ctx.fillText('Mouse: click to move', 10, 40);
        }
    }
}

// Helper: Draw Debug Console
function drawDebugConsole() {
    const ctx = gameState.ctx;
    const debugX = 10;
    const debugY = gameState.canvas.height - 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(debugX - 5, debugY - 85, 280, 90);
    
    ctx.fillStyle = gameState.features.colorMode ? '#00FF00' : '#CCCCCC';
    ctx.font = '12px Courier New';
    ctx.fillText(`DEBUG CONSOLE`, debugX, debugY - 70);
    ctx.fillText(`Position: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})`, debugX, debugY - 55);
    ctx.fillText(`Velocity: (${gameState.player.velocityX.toFixed(2)}, ${gameState.player.velocityY.toFixed(2)})`, debugX, debugY - 40);
    
    if (gameState.dimension === '2d') {
        ctx.fillText(`Angle: ${Math.round(gameState.player.angle)} deg`, debugX, debugY - 25);
        ctx.fillText(`FOV: ${gameState.player.fov} deg`, debugX, debugY - 10);
    } else {
        ctx.fillText(`FPS: ${Math.round(1000 / 16)}`, debugX, debugY - 25);
    }
}

function render() {
    const ctx = gameState.ctx;
    
    // Check dimension mode
    if (gameState.dimension === '2d') {
        // 2D FPS mode (Wolfenstein style)
        render2DMode();
        
        // Draw UI on top
        if (gameState.features.healthBar) {
            drawHealthBar();
        }
        if (gameState.features.debugConsole) {
            drawDebugConsole();
        }
        if (gameState.features.tips) {
            drawTips();
        }
        return;
    }
    
    // 1D mode (top-down view)
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
    
    // Draw walls
    if (gameState.features.walls) {
        const wallColor = gameState.features.colorMode ? '#4CAF50' : '#CCCCCC';
        ctx.fillStyle = wallColor;
        gameState.walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
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
                <span class="${status}">${module.price.toFixed(2)} USD</span>
            </div>
            <div class="pricing-item-detail">
                Memory: ${module.memory.toFixed(2)} KB ${isMandatory ? '(required)' : ''}
            </div>
        `;
        
        pricingList.appendChild(item);
    });
    
    // Add dimension cost
    const dimensionCost = PRICING.dimensions[gameState.dimension || '2d'];
    totalModuleCost += dimensionCost.price;
    totalMemory += dimensionCost.memory;
    
    // Calculate time cost
    const elapsed = Date.now() - gameState.startTime;
    const hours = elapsed / 3600000;
    const timeCost = hours * PRICING.hourlyRate;
    
    // Calculate prompt cost
    const promptCost = PRICING.totalPrompts * PRICING.promptRate;
    
    // Calculate energy cost (from project start - 15:00) - in hours
    const energyElapsed = Date.now() - gameState.startTime;
    const energyHours = energyElapsed / 3600000;
    const energyCost = energyHours * PRICING.energyHourlyRate;
    
    // Calculate fun time cost (from page load - when user started playing)
    const funElapsed = Date.now() - gameState.funStartTime;
    const funMinutes = funElapsed / 60000;
    const funTimeCost = funMinutes * PRICING.funTimeRate;
    
    // Calculate average memory cost per active module
    const avgMemoryPerModule = activeModuleCount > 0 ? (totalMemory / activeModuleCount).toFixed(2) : 0;
    
    // Calculate subtotal (before margin)
    const subtotal = totalModuleCost + timeCost + promptCost + funTimeCost + energyCost;
    
    // Calculate margin (10% of subtotal)
    const marginRate = 0.10;
    const marginCost = subtotal * marginRate;
    
    // Calculate final total (subtotal + margin)
    const finalTotal = subtotal + marginCost;
    
    // Update summary
    document.getElementById('memorySize').textContent = `${avgMemoryPerModule} KB/mod - ${totalMemory.toFixed(2)} KB`;
    document.getElementById('moduleCost').textContent = `${activeModuleCount}/${totalModules} - ${totalModuleCost.toFixed(2)} USD`;
    document.getElementById('workTime').textContent = `(${hours.toFixed(2)}h × ${PRICING.hourlyRate} USD/h) ${timeCost.toFixed(2)} USD`;
    document.getElementById('promptCost').textContent = `(${PRICING.totalPrompts} × ${PRICING.promptRate} USD) ${promptCost.toFixed(2)} USD`;
    document.getElementById('energyCost').textContent = `(${energyHours.toFixed(2)}h × ${PRICING.energyHourlyRate} USD/h) ${energyCost.toFixed(2)} USD`;
    document.getElementById('funTime').textContent = `(${funMinutes.toFixed(2)}min × ${PRICING.funTimeRate} USD/min) ${funTimeCost.toFixed(2)} USD`;
    document.getElementById('marginCost').textContent = `${marginCost.toFixed(2)} USD`;
    document.getElementById('totalCost').textContent = `${finalTotal.toFixed(2)} USD`;
}


// Start game when page loads
window.addEventListener('load', init);
