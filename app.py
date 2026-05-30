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
    return render_template('student_dashboard.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

@app.route('/gp-calculator')
def gp_calculator():
    return render_template('gp_calculator.html')

@app.route('/admin-dashboard')
def admin_dashboard():
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute('SELECT COUNT(*) as count FROM users WHERE `role` = %s', ('student',))
        total_students = cursor.fetchone()['count']

        cursor.execute('SELECT COUNT(*) as count FROM results')
        total_results = cursor.fetchone()['count']

        cursor.execute('SELECT COUNT(*) as count FROM courses')
        total_courses = cursor.fetchone()['count']

        cursor.execute('SELECT * FROM users WHERE `role` = %s ORDER BY created_at DESC LIMIT 10', ('student',))
        students = cursor.fetchall()

        return render_template('admin_dashboard.html',
                             total_students=total_students,
                             total_results=total_results,
                             total_courses=total_courses,
                             students=students)
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')
        return render_template('admin_dashboard.html',
                             total_students=0,
                             total_results=0,
                             total_courses=0,
                             students=[])
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

@app.route('/manage-results')
def manage_results():
    return render_template('manage_results.html')


@app.route('/add-result', methods=['POST'])
def add_result():
    matric_number = request.form.get('matric_number')
    course_name = request.form.get('course_name')
    course_code = request.form.get('course_code')
    credit_unit = request.form.get('credit_unit')
    score = float(request.form.get('score'))
    semester = request.form.get('semester')
    level = request.form.get('level')
    session_year = request.form.get('session')
    is_carryover = request.form.get('is_carryover')

    # Calculate grade and grade point
    if score >= 70:
        grade, grade_point = 'A', 5.0
    elif score >= 60:
        grade, grade_point = 'B', 4.0
    elif score >= 50:
        grade, grade_point = 'C', 3.0
    elif score >= 45:
        grade, grade_point = 'D', 2.0
    elif score >= 40:
        grade, grade_point = 'E', 1.0
    else:
        grade, grade_point = 'F', 0.0

    db = None
    cursor = None

    try:
        db = get_db()
        cursor = db.cursor()

        # Get student ID from matric number
        cursor.execute('SELECT id FROM users WHERE matric_number = %s', (matric_number,))
        student = cursor.fetchone()

        if not student:
            flash('Student with this matric number not found!', 'error')
            return redirect(url_for('manage_results'))

        user_id = student['id']

        # Insert course
        cursor.execute('''
            INSERT INTO courses (user_id, course_name, course_code, credit_unit, semester, level, session)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (user_id, course_name, course_code, credit_unit, semester, level, session_year))

        course_id = cursor.lastrowid

        # Insert result
        cursor.execute('''
            INSERT INTO results (user_id, course_id, score, grade, grade_point, is_carryover, session)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (user_id, course_id, score, grade, grade_point, is_carryover, session_year))

        db.commit()
        flash('Result added successfully!', 'success')
        return redirect(url_for('manage_results'))

    except Exception as e:
        flash(f'Error adding result: {str(e)}', 'error')
        return redirect(url_for('manage_results'))

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()            

if __name__ == '__main__':
    app.run(debug=True)