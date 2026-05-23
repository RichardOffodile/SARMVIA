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
}