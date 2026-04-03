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
            const colors = ['rgba(75, 107, 251, 0.4)', 'rgba(248, 116, 49, 0.4)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
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
        
        // Use a more efficient way to draw and connect particles
        const particlesCount = particlesArray.length;
        for (let i = 0; i < particlesCount; i++) {
            const p1 = particlesArray[i];
            p1.update();
            p1.draw();
            
            // Only connect if distance is small (limit the number of checks)
            for (let j = i + 1; j < particlesCount; j++) {
                const p2 = particlesArray[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distanceSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt

                if (distanceSq < 10000) { // 100 * 100
                    const distance = Math.sqrt(distanceSq);
                    ctx.beginPath();
                    ctx.strokeStyle = p1.color.replace('0.4', (0.1 - distance/1000).toString());
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
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

// Navigation Scroll Highlighting with Debounce
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        const pageYOffset = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        // Only update highlights if we actually found a section to highlight
        if (current) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                // Only handle in-page links starting with #
                if (href && href.startsWith('#')) {
                    link.classList.remove('active');
                    if (href === '#' + current || (current === 'home' && href === '#home')) {
                        link.classList.add('active');
                    }
                }
            });
        }
    });
});

// Fix unintended hover effects during scroll
let isScrolling;
let scrollStartPos = 0;

window.addEventListener('scroll', () => {
    // Add class on scroll start
    if (!document.body.classList.contains('disable-hover')) {
        document.body.classList.add('disable-hover');
    }
    
    window.clearTimeout(isScrolling);
    
    isScrolling = setTimeout(() => {
        document.body.classList.remove('disable-hover');
    }, 200); // Increased timeout slightly for better robustness
}, { passive: true });

// Download Loader Function
function startDownload(btn) {
    const btnText = btn.querySelector('#btn-text');
    const btnLoader = btn.querySelector('#btn-loader');
    const downloadMsg = document.getElementById('download-msg');
    const downloadUrl = btn.getAttribute('data-url');
    
    // Check if already downloading
    if (btn.classList.contains('downloading')) return;
    
    btn.classList.add('downloading');
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    downloadMsg.style.display = 'block';
    downloadMsg.textContent = 'Preparing your secure download...';
    
    // Simulate server-side check/delay (1.5 seconds)
    setTimeout(() => {
        // Obscured download trigger
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        // Reset button state
        setTimeout(() => {
            btn.classList.remove('downloading');
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            downloadMsg.textContent = 'Download started!';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                downloadMsg.style.display = 'none';
            }, 3000);
        }, 1000);
    }, 1500);
}
