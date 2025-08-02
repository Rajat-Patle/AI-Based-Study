import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, render_template, request, redirect, url_for, session, flash

app = Flask(__name__)
app.secret_key = '9b65f7d0a1f2c47e3c34ad99a3f7996c'

# Initialize Firebase Admin SDK
cred = credentials.Certificate('Firebase-Config/firebase_config.json')  # Update with your Firebase Admin SDK path
firebase_admin.initialize_app(cred)

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        try:
            # Firebase authentication
            user = auth.get_user_by_email(email)
            
            # Assuming the password is verified on the client side
            # Here you can add logic to handle user session
            session['loggedin'] = True
            session['uid'] = user.uid
            session['name'] = user.display_name if user.display_name else 'User'
            
            return redirect(url_for('dashboard'))
        except auth.AuthError as e:
            flash('Incorrect email or password!', 'danger')
    
    return render_template('login.html', show_success_modal=False)

@app.route('/forgetpassword')
def forget_password():
    return render_template('forget_password.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', user_name=session['name'])

if __name__ == '__main__':
    app.run(debug=True)
