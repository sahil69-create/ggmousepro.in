/**
 * Comprehensive Authentication System for GG Mouse Pro
 * Includes Password Visibility, Strength Meter, and OTP-based Reset Flow.
 */

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initPasswordStrength();
    initForgotPasswordFlow();
});

/**
 * 1. Password Visibility Toggle
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = btn.closest('.password-input-container');
            const input = container.querySelector('input');
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * 2. Password Strength Meter
 */
function initPasswordStrength() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Only apply to signup and reset forms
        if (input.id === 'password' && document.getElementById('signup-form') || input.id === 'new-password') {
            const bar = input.id === 'new-password' ? document.getElementById('reset-strength-bar') : document.getElementById('password-strength-bar');
            const text = input.id === 'new-password' ? document.getElementById('reset-strength-text') : document.getElementById('password-strength-text');
            
            if (!bar || !text) return;

            input.addEventListener('input', () => {
                const val = input.value;
                const result = calculateStrength(val);
                
                bar.style.width = result.percent + '%';
                bar.style.backgroundColor = result.color;
                text.innerText = result.label;
                text.style.color = result.color;
            });
        }
    });
}

function calculateStrength(password) {
    let score = 0;
    if (!password) return { percent: 0, label: '', color: '#eee' };
    
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const results = [
        { percent: 20, label: 'Very Weak', color: '#dc3545' },
        { percent: 40, label: 'Weak', color: '#ffc107' },
        { percent: 60, label: 'Fair', color: '#007bff' },
        { percent: 80, label: 'Good', color: '#20c997' },
        { percent: 100, label: 'Strong', color: '#28a745' }
    ];
    
    return results[score - 1] || results[0];
}

/**
 * 3. Forgot Password Flow
 */
function initForgotPasswordFlow() {
    const forgotLink = document.getElementById('forgot-password-link');
    const modal = document.getElementById('forgot-password-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (!forgotLink || !modal) return;

    // Show/Hide Modal
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        resetResetSteps();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Step 1: Request OTP
    const requestForm = document.getElementById('request-otp-form');
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        
        // Mocking API call to send OTP
        showToast('Sending OTP...', 'info');
        await new Promise(r => setTimeout(r, 1000));
        
        // In a real app, the server generates and sends the OTP. 
        // For this demo, we'll store it in sessionStorage with an expiry.
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + (15 * 60 * 1000); // 15 minutes
        
        sessionStorage.setItem('reset_otp', otp);
        sessionStorage.setItem('reset_expiry', expiry);
        sessionStorage.setItem('reset_email', email);
        sessionStorage.setItem('reset_attempts', '3');

        console.log(`[DEMO] OTP for ${email} is: ${otp}`);
        showToast(`OTP sent to ${email}`, 'success');
        
        document.getElementById('reset-step-1').style.display = 'none';
        document.getElementById('reset-step-2').style.display = 'block';
    });

    // Step 2: Verify OTP
    const verifyForm = document.getElementById('verify-otp-form');
    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredOtp = document.getElementById('otp-code').value;
        const storedOtp = sessionStorage.getItem('reset_otp');
        const expiry = parseInt(sessionStorage.getItem('reset_expiry'));
        let attempts = parseInt(sessionStorage.getItem('reset_attempts'));

        if (Date.now() > expiry) {
            showToast('OTP expired. Please request a new one.', 'error');
            resetResetSteps();
            return;
        }

        if (enteredOtp === storedOtp) {
            showToast('OTP Verified!', 'success');
            document.getElementById('reset-step-2').style.display = 'none';
            document.getElementById('reset-step-3').style.display = 'block';
        } else {
            attempts--;
            sessionStorage.setItem('reset_attempts', attempts);
            document.getElementById('otp-attempts').innerText = attempts;
            
            if (attempts <= 0) {
                showToast('Too many failed attempts. Please restart.', 'error');
                resetResetSteps();
            } else {
                showToast(`Invalid OTP. ${attempts} attempts left.`, 'error');
            }
        }
    });

    // Resend OTP
    const resendBtn = document.getElementById('resend-otp-btn');
    resendBtn.addEventListener('click', () => {
        let attempts = parseInt(sessionStorage.getItem('reset_attempts'));
        if (attempts > 0) {
            requestForm.dispatchEvent(new Event('submit'));
        } else {
            showToast('No more resend attempts available.', 'error');
        }
    });

    // Step 3: Reset Password
    const resetForm = document.getElementById('reset-password-form');
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPass = document.getElementById('new-password').value;
        
        if (calculateStrength(newPass).percent < 60) {
            showToast('Please choose a stronger password.', 'warning');
            return;
        }

        showToast('Updating password...', 'info');
        await new Promise(r => setTimeout(r, 1500));
        
        // In a real app, send newPass and the email/OTP token to the backend
        showToast('Password updated successfully!', 'success');
        
        setTimeout(() => {
            modal.style.display = 'none';
            window.location.href = 'login.html';
        }, 2000);
    });
}

function resetResetSteps() {
    document.getElementById('reset-step-1').style.display = 'block';
    document.getElementById('reset-step-2').style.display = 'none';
    document.getElementById('reset-step-3').style.display = 'none';
    document.getElementById('request-otp-form').reset();
    document.getElementById('verify-otp-form').reset();
    document.getElementById('reset-password-form').reset();
    sessionStorage.removeItem('reset_otp');
    sessionStorage.removeItem('reset_expiry');
}

/**
 * Utility: Show Toast
 */
function showToast(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}
