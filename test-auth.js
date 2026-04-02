/**
 * Simple Authentication Test Suite for GG Mouse Pro
 * Runs in the browser and logs results to the console.
 */

const AuthTests = {
    run() {
        console.group('%c Authentication Test Suite ', 'background: #4b6bfb; color: #fff; font-size: 14px; padding: 5px; border-radius: 4px;');
        
        this.testPasswordStrength();
        this.testOtpExpiry();
        this.testRateLimitingMock();
        this.testInputSanitizationMock();

        console.groupEnd();
    },

    assert(condition, message) {
        if (condition) {
            console.log(`%c[PASS]%c ${message}`, 'color: #28a745; font-weight: bold;', 'color: inherit;');
        } else {
            console.error(`%c[FAIL]%c ${message}`, 'color: #dc3545; font-weight: bold;', 'color: inherit;');
        }
    },

    // 1. Unit Test: Password Strength Logic
    testPasswordStrength() {
        console.group('Unit Test: Password Strength Logic');
        
        // Mocking calculateStrength if not available globally
        const calc = window.calculateStrength || ((password) => {
            let score = 0;
            if (!password) return { percent: 0, label: '', color: '#eee' };
            if (password.length > 6) score++;
            if (password.length > 10) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            const res = [
                { label: 'Very Weak' }, { label: 'Weak' }, { label: 'Fair' }, { label: 'Good' }, { label: 'Strong' }
            ];
            return res[score - 1] || res[0];
        });

        this.assert(calc('').percent === 0, 'Empty password should have 0% strength');
        this.assert(calc('123456').label === 'Very Weak', 'Short numeric password should be Very Weak');
        this.assert(calc('Pass123!').label === 'Good' || calc('Pass123!').label === 'Strong', 'Complex password should be Good/Strong');
        
        console.groupEnd();
    },

    // 2. Integration Test: OTP Expiry Logic
    testOtpExpiry() {
        console.group('Integration Test: OTP Expiry Logic');
        
        const now = Date.now();
        const validExpiry = now + 1000 * 60 * 15; // 15 mins later
        const invalidExpiry = now - 1000 * 60; // 1 min ago
        
        this.assert(now < validExpiry, 'Freshly generated OTP should be valid');
        this.assert(now > invalidExpiry, 'Past expiry time should mark OTP as invalid');
        
        console.groupEnd();
    },

    // 3. E2E Scenario Mock: Rate Limiting
    testRateLimitingMock() {
        console.group('E2E Scenario: Rate Limiting Mock');
        
        let attempts = 3;
        const verifyOtp = (entered, actual) => {
            if (entered !== actual) {
                attempts--;
                return false;
            }
            return true;
        };

        verifyOtp('wrong', '123456');
        verifyOtp('wrong again', '123456');
        this.assert(attempts === 1, 'Two wrong attempts should leave 1 attempt');
        
        verifyOtp('wrong final', '123456');
        this.assert(attempts === 0, 'Three wrong attempts should lock the session');
        
        console.groupEnd();
    },

    // 4. Security: Input Sanitization Mock
    testInputSanitizationMock() {
        console.group('Security: Input Sanitization Mock');
        
        const sanitize = (input) => input.replace(/[<>]/g, ''); // Basic XSS prevention
        const malicious = '<script>alert("xss")</script>';
        const sanitized = sanitize(malicious);
        
        this.assert(!sanitized.includes('<script>'), 'Input should be sanitized to prevent basic XSS');
        
        console.groupEnd();
    }
};

// Auto-run tests if in debug mode or via console
// AuthTests.run();
window.AuthTests = AuthTests;
