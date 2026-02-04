// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

// Particle Background Animation
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Set canvas dimensions
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; // Or section height if needed
    }

    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
        init();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(0, 255, 136, ${Math.random() * 0.5})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

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
        }
    }

    function init() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            connectParticles(i);
        }
        requestAnimationFrame(animate);
    }

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
            }
        }
    }

    init();
    animate();
}

// Scroll Animation Intersection Observer
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add animation classes to elements
document.querySelectorAll('.feature-card, .product-card, .section-header, .step-card, .screenshot-item, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Navigation Scroll Highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Download Loader Function
function startDownload() {
    const btn = document.getElementById('download-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const msg = document.getElementById('download-msg');
    
    if (btn && btnText && btnLoader && msg) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        btn.disabled = true;
        
        setTimeout(() => {
            btnLoader.style.display = 'none';
            btnText.style.display = 'inline';
            btnText.innerText = "Downloaded!";
            btn.style.backgroundColor = "#333";
            msg.style.display = 'block';
            msg.innerText = "Download started automatically. Check your notifications.";
            
            // Create a dummy download link
            const link = document.createElement('a');
            link.href = 'https://play.google.com/store/apps/details?id=com.zjx.ztezscreenshot&pcampaignid=web_share'; // In a real app, this would be the APK URL
            link.download = 'GGMousePro_v2.4.1.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        }, 2000);
    }
}
