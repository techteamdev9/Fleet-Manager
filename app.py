from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import os

# ---------------- CONFIG ----------------
#sqlite
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB = os.path.join(BASE_DIR, "fleet_app.db")

#mysql
# DB_CONFIG = {
#     "host": "localhost",
#     "user": "fleet_user",
#     "password": "strong_password",
#     "database": "fleet_manager"
# }

# ---------------- CONFIG ----------------
import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASS", "mysqlp123"),
    "database": os.getenv("DB_NAME", "fleet_manager"),
    "port":3306
}



app = Flask(__name__)
CORS(app, supports_credentials=True)

# ---------------- DB ----------------
# def connect():
#     conn = sqlite3.connect(DB)
#     conn.row_factory = sqlite3.Row
#     return conn
def connect():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn


def init_db():
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
   CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
)
    """)

    cur.execute("""
   CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_number VARCHAR(50) NOT NULL,
    tool_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL
)
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
)
    """)

    # create default users safely
    cur.execute("""
    INSERT IGNORE INTO users (username, password, role)
    VALUES (%s, %s, %s)
    """, ("admin", "admin123", "admin"))

    cur.execute("""
    INSERT IGNORE INTO users (username, password, role)
    VALUES (%s, %s, %s)
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

    cur.execute("""
        SELECT u.username, p.name AS role
        FROM users u
        JOIN permissions p ON u.permission_id = p.id
        WHERE u.username=%s AND u.password=%s
    """, (data["username"].strip(), data["password"].strip()))

    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # force role to lowercase
    return jsonify({
        "username": user[0],
        "role": user[1].lower()   # i changed this
    })




@app.route("/vehicles", methods=["GET"])
def vehicles():
    q = request.args.get("q", "")
    conn = connect()
    cur = conn.cursor()

    if q:
        q = f"%{q}%"
        cur.execute("""
            SELECT * FROM vehicles
            WHERE license_number LIKE %s
               OR tool_code LIKE %s
               OR status LIKE %s
        """, (q, q, q))
    else:
        cur.execute("SELECT * FROM vehicles")

    rows = [dict(zip([col[0] for col in cur.description], r)) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)


@app.route("/vehicles", methods=["POST"])
def add_vehicle():
    # Get data from the request
    data = request.get_json()
    license_number = data.get("license_number")
    tool_code = data.get("tool_code")
    status = data.get("status")

    # Connect to the database
    conn = connect()
    cur = conn.cursor()

    # Insert vehicle into the vehicles table
    cur.execute("INSERT INTO vehicles (license_number, tool_code, status) VALUES (%s, %s, %s)",
                (license_number, tool_code, status))
    
    # Get the vehicle_id of the newly inserted vehicle
    vehicle_id = cur.lastrowid

    # Insert an initial history record for this new vehicle
    cur.execute("INSERT INTO history (vehicle_id, status) VALUES (%s, %s)",
                (vehicle_id, status))

    # Commit the changes and close the cursor and connection
    conn.commit()
    cur.close()
    conn.close()

    # Return a success message
    return jsonify({"message": "Vehicle added successfully and history recorded!"})



@app.route("/vehicles/<int:id>", methods=["PUT"])
def update_vehicle(id):
    data = request.get_json()
    status = data.get("status")
    license_number = data.get("license_number")
    tool_code = data.get("tool_code")

    conn = connect()
    cur = conn.cursor()

    # Update vehicle
    cur.execute("UPDATE vehicles SET license_number=%s, tool_code=%s, status=%s WHERE id=%s",
                (license_number, tool_code, status, id))

    # Insert a new history record
    cur.execute("INSERT INTO history (vehicle_id, status) VALUES (%s, %s)",
                (id, status))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Vehicle updated and history recorded"})



@app.route("/vehicles/<int:vid>", methods=["DELETE"])
def delete_vehicle(vid):
    conn = connect()
    cur = conn.cursor()

    # First, delete the history records associated with the vehicle
    cur.execute("DELETE FROM vehicle_history WHERE vehicle_id=%s", (vid,))

    # Now, delete the vehicle
    cur.execute("DELETE FROM vehicles WHERE id=%s", (vid,))

    conn.commit()
    conn.close()

    return jsonify({"ok": True})


@app.route("/vehicles/<int:vehicle_id>/history")
def vehicle_history(vehicle_id):
    conn = None  # <--- Declare conn here so it's always defined
    try:
        # Establish DB connection
        conn = connect()
        if not conn:
            print("Unable to connect to database")
            return jsonify({"error": "Unable to connect to database"}), 500

        cursor = conn.cursor(dictionary=True)  # rows as dict
        print(f"Fetching history for vehicle ID: {vehicle_id}")

        cursor.execute("""
            SELECT timestamp, status
            FROM history
            WHERE vehicle_id = %s
            ORDER BY timestamp DESC
        """, (vehicle_id,))
        
        rows = cursor.fetchall()

        if not rows:
            print("No history found for vehicle:", vehicle_id)
            return jsonify([])

        print(f"History for vehicle {vehicle_id}: {rows}")
        return jsonify(rows)

    except Exception as e:
        print(f"Error fetching vehicle history: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500

    finally:
        if conn:
            conn.close()




# ------------------------ Stats Endpoint ------------------------
@app.route("/stats", methods=["GET"])
def stats():
    # Only admin can access
    # In real app, add session/cookie check; here we assume front-end sends username
    username = request.args.get("username", "")
    
    conn = connect()
    cur = conn.cursor(dictionary=True)

    # Get current date stats from the history table
    today = datetime.now().strftime("%Y-%m-%d")
    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM history h
        WHERE DATE(h.timestamp) = %s
        GROUP BY status
    """, (today,))
    today_stats = {row["status"]: row["count"] for row in cur.fetchall()}

    # Get previous day stats from the history table
    prev_day = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM history h
        WHERE DATE(h.timestamp) = %s
        GROUP BY status
    """, (prev_day,))
    prev_stats = {row["status"]: row["count"] for row in cur.fetchall()}

    conn.close()

    return jsonify({
        "today": today_stats,
        "previous": prev_stats
    })





# ------------------------ Reports Endpoint ------------------------
@app.route("/reports")
def get_reports():
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    query = "SELECT status FROM history WHERE 1"

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






# ---------------- TEMP: Show all users ----------------
@app.route("/debug_users")
def debug_users():
    conn = connect()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()
    conn.close()

    # Build simple HTML table
    html = "<h2>All Users in DB</h2><table border='1'><tr><th>ID</th><th>Username</th><th>Password</th><th>Role</th></tr>"
    for u in users:
        html += f"<tr><td>{u['id']}</td><td>{u['username']}</td><td>{u['password']}</td><td>{u['role']}</td></tr>"
    html += "</table>"
    return html

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
