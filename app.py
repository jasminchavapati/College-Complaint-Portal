from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATABASE = 'complaints.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  
    return conn

def create_table_if_not_exists():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            privacy TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending'
        )
    ''')
    conn.commit()
    conn.close()
    print("Database initialization successful!")

# --- HTML ROUTES ---

@app.route('/')
def home():
    # This will now load your index.html from the templates folder
    return render_template('index.html')

@app.route('/admin-view')
def admin_view():
    # Route to show your admin dashboard HTML
    return render_template('admin_dashboard.html')

# --- API ROUTES ---

@app.route('/api/complaints', methods=['POST', 'OPTIONS'])
def submit_complaint():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        conn = get_db_connection()
        c = conn.cursor()
        c.execute(
            "INSERT INTO complaints (role, category, title, description, privacy) VALUES (?, ?, ?, ?, ?)",
            (data['role'], data['category'], data['title'], data['description'], data['privacy'])
        )
        conn.commit()
        last_id = c.lastrowid
        conn.close()
        return jsonify({'message': 'Success!', 'complaintId': last_id}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        conn = get_db_connection()
        complaints = conn.execute("SELECT * FROM complaints ORDER BY id DESC").fetchall()
        conn.close()
        complaints_list = [dict(row) for row in complaints]
        return jsonify(complaints_list)
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT', 'OPTIONS'])
def update_status(complaint_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("UPDATE complaints SET status = ? WHERE id = ?", (data['status'], complaint_id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Status Updated!'})
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    create_table_if_not_exists()
    app.run(debug=True, host='0.0.0.0', port=5000)