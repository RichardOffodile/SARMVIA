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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        role = request.form.get('role')
        password = request.form.get('password')
        matric_number = request.form.get('matric_number')
        email = request.form.get('email')

        db = None
        cursor = None

        try:
            db = get_db()
            cursor = db.cursor()

            if role == 'student':
                cursor.execute('SELECT * FROM users WHERE matric_number = %s AND `role` = %s', (matric_number, role))
            else:
                cursor.execute('SELECT * FROM users WHERE email = %s AND `role` = %s', (email, role))

            user = cursor.fetchone()

            if user and bcrypt.check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                session['role'] = user['role']
                session['full_name'] = user['full_name']
                flash('Login successful!', 'success')

                if role == 'student':
                    return redirect(url_for('student_dashboard'))
                else:
                    return redirect(url_for('admin_dashboard'))
            else:
                flash('Invalid credentials. Please try again', 'error')
                return redirect(url_for('login'))
            
        except Exception as e:
            flash(f'Login failed: {str(e)}', 'error')
            return redirect(url_for('login'))
        
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    return render_template('login.html')


@app.route('/student-dashboard')
def student_dashboard():
    return 'Student Dashboard Coming Soon!'


@app.route('/admin-dashboard')
def admin_dashboard():
    return 'Admin dashboard Coming Soon!'

if __name__ == '__main__':
    app.run(debug=True)