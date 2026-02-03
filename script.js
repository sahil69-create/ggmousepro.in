const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;
let animationId;

// Set canvas dimensions
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

setCanvasSize();

// Handle resize
window.addEventListener('resize', () => {
    setCanvasSize();
    init();
});

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(0, 255, 136, ${Math.random() * 0.5})`; // Neon green with opacity
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
    }
}

// Initialize particles
function init() {
    particlesArray = [];
    const numberOfParticles = (canvas.width * canvas.height) / 15000; // Density based on screen size
    
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Connect particles (optional, for tech look)
        connectParticles(i);
    }
    
    requestAnimationFrame(animate);
}

// Connect close particles with lines
function connectParticles(index) {
    for (let j = index; j < particlesArray.length; j++) {
        const dx = particlesArray[index].x - particlesArray[j].x;
        const dy = particlesArray[index].y - particlesArray[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.1 - distance/1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[index].x, particlesArray[index].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow for lines to save performance
        }
    }
}

// Glitch text effect for heading (optional JS enhancement)
const glitchText = document.querySelector('.glitch-text');
if (glitchText) {
    setInterval(() => {
        const original = glitchText.getAttribute('data-text');
        
        // 5% chance to glitch
        if (Math.random() < 0.05) {
            glitchText.style.textShadow = '2px 0 #ff00ea, -2px 0 #00d4ff';
            setTimeout(() => {
                glitchText.style.textShadow = 'none';
            }, 100);
        }
    }, 1000);
}

// Start
init();
animate();
