from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

# ---------------- CONFIG ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "fleet_app.db")

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ---------------- DB ----------------
def connect():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_number TEXT NOT NULL,
        tool_code TEXT NOT NULL,
        status TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    )
    """)

    # create default users safely
    cur.execute("""
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES (?, ?, ?)
    """, ("admin", "admin123", "admin"))

    cur.execute("""
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES (?, ?, ?)
    """, ("user", "user123", "user"))

    conn.commit()
    conn.close()

# 🔥 MUST NOT BE INDENTED
init_db()

# ---------------- ROUTES ----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = connect()
    cur = conn.cursor()
    cur.execute(
        "SELECT username, role FROM users WHERE username=? AND password=?",
        (data["username"].strip(), data["password"].strip())
    )
    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify(dict(user))

@app.route("/vehicles", methods=["GET"])
def vehicles():
    q = request.args.get("q", "")
    conn = connect()
    cur = conn.cursor()

    if q:
        q = f"%{q}%"
        cur.execute("""
            SELECT * FROM vehicles
            WHERE license_number LIKE ? OR tool_code LIKE ? OR status LIKE ?
        """, (q, q, q))
    else:
        cur.execute("SELECT * FROM vehicles")

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/vehicles", methods=["POST"])
def add_vehicle():
    d = request.json
    conn = connect()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO vehicles (license_number, tool_code, status) VALUES (?,?,?)",
        (d["license_number"], d["tool_code"], d["status"])
    )
    vid = cur.lastrowid

    cur.execute(
        "INSERT INTO vehicle_history (vehicle_id, status, timestamp) VALUES (?,?,?)",
        (vid, d["status"], datetime.now().astimezone().strftime("%d-%m-%Y %H:%M:%S"))
    )

    conn.commit()
    conn.close()
    return jsonify({"id": vid})

@app.route("/vehicles/<int:vid>", methods=["PUT"])
def update_vehicle(vid):
    d = request.json
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        UPDATE vehicles
        SET license_number=?, tool_code=?, status=?
        WHERE id=?
    """, (d["license_number"], d["tool_code"], d["status"], vid))

    cur.execute(
        "INSERT INTO vehicle_history (vehicle_id, status, timestamp) VALUES (?,?,?)",
        (vid, d["status"], datetime.now().astimezone().strftime("%d-%m-%Y %H:%M:%S"))
    )

    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/vehicles/<int:vid>", methods=["DELETE"])
def delete_vehicle(vid):
    conn = connect()
    cur = conn.cursor()
    cur.execute("DELETE FROM vehicles WHERE id=?", (vid,))
    cur.execute("DELETE FROM vehicle_history WHERE vehicle_id=?", (vid,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/vehicles/<int:vid>/history", methods=["GET"])
def history(vid):
    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        SELECT status, timestamp
        FROM vehicle_history
        WHERE vehicle_id=?
        ORDER BY timestamp ASC
    """, (vid,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
