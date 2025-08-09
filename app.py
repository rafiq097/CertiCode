from flask import Flask, render_template
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, ValidationError
import bcrypt
from flask_mysqldb import MySQL

app = Flask(__name__)

app.config['MYSQL_HOST'] = ''
app.config['MYSQL_USER'] = ''
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = ''
app.secret_key = ''

mysql = MySQL(app)

class RegisterForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Register")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/register')
def register():
    form = RegisterForm()
    if(form.validate_on_submit()):
        name = form.name.data
        email = form.email.data
        password = form.password.data
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10))
        
    return render_template("register.html")

@app.route('/admin')
def admin():
    return render_template('admin.html')

if __name__ == "__main__":
    app.run(debug=True)