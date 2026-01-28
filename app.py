from flask import Flask, request, jsonify,  render_template
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app,
 supports_credentials=True,

)

DB = "fleet_app.db"

def connect():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

#home route
@app.route("/")
def home():
    return render_template("index.html")

#debug test temporary
@app.route("/debug/db-path")
def debug_db_path():
    return jsonify({
        "cwd": os.getcwd(),
        "db_exists": os.path.exists(DB),
        "db_absolute_path": os.path.abspath(DB)
    })

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = connect()
    cur = conn.cursor()
    cur.execute(
        "SELECT username, role FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    )
    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify(dict(user))

# ---------------- VEHICLES ----------------
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
        (vid, d["status"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
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
        (vid, d["status"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
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