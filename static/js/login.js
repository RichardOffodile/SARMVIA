function validateMatric(matric) {
        const matricPattern = /^[A-Z]+\/\d{4}\/\d+$/;
        return matricPattern.test(matric);
    }

function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

function toggleLoginFields() {
    const role = document.getElementById('role').value;

    // Get all fields
    const matricField = document.getElementById('matric-field');
    const emailField = document.getElementById('email-field');
    const passwordField = document.getElementById('password-field');
    const forgotField = document.getElementById('forgot-field');
    const loginBtn = document.getElementById('login-btn');

    // Hide Everything first
    matricField.style.display = 'none';
    emailField.style.display = 'none';
    passwordField.style.display = 'none';
    forgotField.style.display = 'none';
    loginBtn.style.display = 'none';

    // Show based on role
    if (role === 'student') {
        matricField.style.display = 'flex';
        passwordField.style.display = 'flex';
        forgotField.style.display = 'flex';
        loginBtn.style.display = 'block';
    } else if (role === 'admin') {
        emailField.style.display = 'flex';
        passwordField.style.display = 'flex';
        forgotField.style.display = 'flex';
        loginBtn.style.display = 'block';
    }

    // Matric validation for student
    document.getElementById('matric').addEventListener('blur', function() {
        const matric = this.value.toUpperCase();
        const errorEl = document.getElementById('matric-error');

        if (matric && !validateMatric(matric)) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Invalid matric number. Example: CS/2022/1268';
            this.style.borderColor = 'red';
        } else {
            errorEl.style.display = 'none';
            this.style.borderColor = '#c9a84c';
        }
    });

    // Email validation for admin
    document.getElementById('email-error').addEventListener('blur', function() {
        const email = this.value;
        const errorEl = document.getElelmentById('email-error');

        if (email && !validateEmail(email)) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Invalid email address';
            this.style.borderColor = 'red';
        } else {
            errorEl.style.display = 'none';
            this.style.borderColor = '#c9a84c';
        }
    });
}

// Reset form on page load
   window.onload = function() {
        document.getElementById('role').selectedIndex = 0;
        toggleLoginFields();
    }