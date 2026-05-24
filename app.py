from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_bcrypt import Bcrypt
import pymysql

app = Flask(__name__)
app.secret_key = 'sarmvia_secret_key'
bcrypt = Bcrypt(app)

# Database connection
def get_db():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='fIbjin-dumni7-qovwib',
        database='sarmvia',
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get form data
        full_name = request.form.get('full_name')
        role = request.form.get('role')
        email = request.form.get('email')
        matric_number = request.form.get('matric_number')
        department = request.form.get('department')
        faculty = request.form.get('faculty')
        level = request.form.get('level')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check passwords match
        if password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('register'))

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        db = None
        cursor = None

        # Save to database
        try:
            db = get_db()
            cursor = db.cursor()

            cursor.execute('''
                INSERT INTO users 
                (full_name, email, matric_number, department, faculty, level, role, password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (full_name, email, matric_number, department, faculty, level, role, hashed_password))

            db.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))

        except Exception as e:
            flash(f'Registration failed: {str(e)}', 'error')
            return redirect(url_for('register'))

        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()

    return render_template('register.html')  

if __name__ == '__main__':
    app.run(debug=True)