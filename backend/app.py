from flask import Flask, request, jsonify, session
from dotenv import load_dotenv
from flask_cors import CORS
import bcrypt
import os
import jwt
import datetime
import MySQLdb

load_dotenv(dotenv_path="./.env")

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Load config from .env
DB_HOST = os.getenv('MYSQL_HOST')
DB_USER = os.getenv('MYSQL_USER')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD')
DB_NAME = os.getenv('MYSQL_DB')
SECRET_KEY = os.getenv('SECRET_KEY')

app.config['SECRET_KEY'] = SECRET_KEY

# Connection helper
def get_db_connection():
    return MySQLdb.connect(
        host=DB_HOST,
        user=DB_USER,
        passwd=DB_PASSWORD,
        db=DB_NAME,
        charset='utf8mb4'
    )

# Test connection at startup
try:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1")
    conn.close()
    print("MySQL connected successfully")
except Exception as e:
    print("MySQL connection failed:", e)


def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")


def token_required(func):
    def wrapper(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({"status": "error", "message": "Token missing"}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Invalid token"}), 401
        
        return func(user_id, *args, **kwargs)
    
    wrapper.__name__ = func.__name__
    return wrapper


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password.decode('utf-8'))
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "User registered successfully"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
        token = generate_token(user[0])
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }), 200
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401


@app.route('/api/get-user', methods=['GET'])
@token_required
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            "status": "success",
            "user": {"id": user[0], "name": user[1], "email": user[2]}
        })
        
    return jsonify({"status": "error", "message": "User not found"}), 404


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"status": "success", "message": "Logged out successfully"})


if __name__ == "__main__":
    app.run(debug=True)
