function validateMatric(matric) {
    const matricPattern = /^[A-Z]+\/\d{4}\/\d+$/;
    return matricPattern.test(matric);
}

function toggleFields() {
    // Get the Selected Role
    const role = document.getElementById('role').value;

    // Get all fields
    const studentFields = [
        document.getElementById('matric-field'),
        document.getElementById('department-field'),
        document.getElementById('faculty-field'),
        document.getElementById('level-field'),
    ];

    const adminCodeField = document.getElementById('admin-code-field');

    // Hide everything first
    studentFields.forEach(field =>field.style.display = 'none')
    adminCodeField.style.display = 'none';

    // Showed based on role
    if (role === 'student') {
        studentFields.forEach(field => field.style.display = 'flex');
    } else if (role === 'admin') {
        adminCodeField.style.display = 'flex';
    }

    // Matric Input Listener
    document.getElementById('matric').addEventListener('blur', function() {
        const matric = this.value.toUpperCase();
        const errorEl = document.getElementById('matric-error');

        if (matric && !validateMatric(matric)) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Invalid matric number format. Example: CS/2022/1268';
            this.style.borderColor = 'red';
        } else {
            errorEl.style.display = 'none';
            this.style.borderColor = '#c9a84c'
        }
    });

    //Reset form on page load
    window.onload = function() {
        document.getElementById('role').value ='';
        toggleFields();
    }
}