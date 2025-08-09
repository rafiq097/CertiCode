from flask import Flask, request, jsonify, session
from flask_mysqldb import MySQL
from dotenv import load_dotenv
from flask_cors import CORS
import bcrypt
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')
app.secret_key = os.getenv('SECRET_KEY')

mysql = MySQL(app)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password.decode('utf-8')))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"status": "success", "message": "User registered successfully"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
        session['user_id'] = user[0]
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }), 200
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401


if __name__ == "__main__":
    app.run(debug=True)