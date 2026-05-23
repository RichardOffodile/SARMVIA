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
}