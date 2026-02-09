from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pandas as pd
import os

# ---------------- CONFIG ----------------
#for .env locally:
# from dotenv import load_dotenv
#load_dotenv()   # 🔁 load .env

DATABASE_URL = os.getenv("DATABASE_URL")  # 🔁 CHANGED (Render)

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ---------------- DB ----------------

def connect():
    return psycopg2.connect(DATABASE_URL, sslmode="require")  # 🔁 CHANGED


def init_db():
    conn = connect()
    cur = conn.cursor()

    # ---------------- Permissions ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    )
    """)

    cur.execute("""
    INSERT INTO permissions (id, name)
    VALUES (1, 'admin'), (2, 'user')
    ON CONFLICT (id) DO NOTHING
    """)

    # ---------------- Users ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20),
        permission_id INT REFERENCES permissions(id)
    )
    """)

    # ---------------- Vehicles ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        tool_code VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
    )
    """)

    # ---------------- Vehicle History ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_history (
        id SERIAL PRIMARY KEY,
        vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # ---------------- Default users ----------------
    cur.execute("""
    INSERT INTO users (username, password, role, permission_id)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (username) DO NOTHING
    """, ("admin", "admin123", "admin", 1))

    cur.execute("""
    INSERT INTO users (username, password, role, permission_id)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (username) DO NOTHING
    """, ("user", "user123", "user", 2))

    conn.commit()
    conn.close()


# 🔥 run once on startup
init_db()

# ---------------- ROUTES ----------------

@app.route("/")
def home():
    return render_template("index.html")

# ---------------- AUTH ----------------

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        SELECT u.username, p.name
        FROM users u
        JOIN permissions p ON u.permission_id = p.id
        WHERE u.username=%s AND u.password=%s
    """, (data["username"].strip(), data["password"].strip()))

    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "username": user[0],
        "role": user[1].lower()
    })

# ---------------- VEHICLES ----------------

@app.route("/vehicles", methods=["GET"])
def get_vehicles():
    q = request.args.get("q", "")
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if q:
        q = f"%{q}%"
        cur.execute("""
            SELECT * FROM vehicles
            WHERE license_number ILIKE %s
               OR tool_code ILIKE %s
               OR status ILIKE %s
        """, (q, q, q))
    else:
        cur.execute("SELECT * FROM vehicles")

    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)


@app.route("/vehicles", methods=["POST"])
def add_vehicle():
    data = request.json

    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO vehicles (license_number, tool_code, status)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (data["license_number"], data["tool_code"], data["status"]))

    vid = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO vehicle_history (vehicle_id, status)
        VALUES (%s, %s)
    """, (vid, data["status"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Vehicle added"})


@app.route("/vehicles/<int:id>", methods=["PUT"])
def update_vehicle(id):
    data = request.json

    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        UPDATE vehicles
        SET license_number=%s, tool_code=%s, status=%s
        WHERE id=%s
    """, (data["license_number"], data["tool_code"], data["status"], id))

    cur.execute("""
        INSERT INTO vehicle_history (vehicle_id, status)
        VALUES (%s, %s)
    """, (id, data["status"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Vehicle updated"})


@app.route("/vehicles/<int:id>", methods=["DELETE"])
def delete_vehicle(id):
    conn = connect()
    cur = conn.cursor()
    cur.execute("DELETE FROM vehicles WHERE id=%s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# ---------------- HISTORY ----------------

@app.route("/vehicles/<int:id>/history")
def vehicle_history(id):
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT timestamp, status
        FROM vehicle_history
        WHERE vehicle_id=%s
        ORDER BY timestamp DESC
    """, (id,))

    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

# ---------------- STATS ----------------

@app.route("/stats")
def stats():
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM vehicle_history
        WHERE DATE(timestamp)=%s
        GROUP BY status
    """, (today,))
    today_stats = {r["status"]: r["count"] for r in cur.fetchall()}

    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM vehicle_history
        WHERE DATE(timestamp)=%s
        GROUP BY status
    """, (yesterday,))
    prev_stats = {r["status"]: r["count"] for r in cur.fetchall()}

    conn.close()

    return jsonify({
        "today": today_stats,
        "previous": prev_stats
    })

# ---------------- REPORTS ----------------

@app.route("/reports")
def reports():
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    query = "SELECT status FROM vehicle_history WHERE 1=1"
    params = []

    if from_date:
        query += " AND DATE(timestamp) >= %s"
        params.append(from_date)

    if to_date:
        query += " AND DATE(timestamp) <= %s"
        params.append(to_date)

    query += " ORDER BY timestamp DESC"

    conn = connect()
    cur = conn.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return jsonify(rows)


# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
