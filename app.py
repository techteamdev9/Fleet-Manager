from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pandas as pd
import os
import time

# ---------------- CONFIG ----------------
#just for local
#from dotenv import load_dotenv
#load_dotenv() 

DATABASE_URL = os.getenv("DATABASE_URL")  # 🔁 CHANGED (Render)

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ---------------- DB ----------------

# def connect():
#     return psycopg2.connect(DATABASE_URL, sslmode="require")  # 🔁 CHANGED
#test connect
def connect(retries=5, delay=2):
    """Tries to connect to the database, retrying on failure."""
    if not os.getenv("DATABASE_URL"):
        raise Exception("DATABASE_URL not set!")
    
    while retries > 0:
        try:
            return psycopg2.connect(os.getenv("DATABASE_URL"), sslmode="require")
        except Exception as e:
            print(f"Failed to connect, retrying in {delay}s...", e)
            retries -= 1
            time.sleep(delay)
    
    raise Exception("Could not connect to DB after retries")

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

    def init_db():
        conn = connect()
        cur = conn.cursor()

    # ---------------- Vehicles ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        tool_code VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
    )
    """)

    # ✅ Ensure available_for_service column always exists
    cur.execute("""
    ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS available_for_service BOOLEAN DEFAULT TRUE;
    """)

    # ✅ Ensure old rows are TRUE (ניתן לגיוס)
    cur.execute("""
    UPDATE vehicles
    SET available_for_service = TRUE
    WHERE available_for_service IS NULL;
    """)

    # ✅ Prevent NULL in future
    cur.execute("""
    ALTER TABLE vehicles
    ALTER COLUMN available_for_service SET NOT NULL;
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
# 🔥 Run database initialization safely
#init_db() #for manual init
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
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    q = request.args.get("q")

    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---- SEARCH + DATE FILTER ----
    if from_date and to_date:
        query = """
            SELECT DISTINCT v.*
            FROM vehicles v
            JOIN vehicle_history vh ON vh.vehicle_id = v.id
            WHERE DATE(vh.timestamp) >= %s
              AND DATE(vh.timestamp) <= %s
        """
        params = [from_date, to_date]

        if q:
            query += """
              AND (
                  v.license_number ILIKE %s OR
                  v.tool_code ILIKE %s OR
                  v.status ILIKE %s
              )
            """
            params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])

        query += " ORDER BY v.id ASC"
        cur.execute(query, params)

    # ---- SEARCH ONLY ----
    elif q:
        query = """
            SELECT *
            FROM vehicles
            WHERE license_number ILIKE %s
               OR tool_code ILIKE %s
               OR status ILIKE %s
            ORDER BY id ASC
        """
        cur.execute(query, (f"%{q}%", f"%{q}%", f"%{q}%"))

    # ---- NO FILTERS ----
    else:
        cur.execute("SELECT * FROM vehicles ORDER BY id ASC")

    rows = cur.fetchall()
    conn.close()

    return jsonify(rows)




@app.route("/vehicles", methods=["POST"])
def add_vehicle():
    data = request.json
    available = data.get("available_for_service", True)  # default = ניתן
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO vehicles (license_number, tool_code, status, available_for_service)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (
        data["license_number"],
        data["tool_code"],
        data["status"],
        available))

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

    # Update vehicle details including the available_for_service field
    print(data)
    available = data.get("available_for_service", True)  # default = ניתן
    cur.execute("""
        UPDATE vehicles
        SET license_number = %s,
            tool_code = %s,
            status = %s,
            available_for_service = %s  -- Added field here
        WHERE id = %s
    """, (
        data["license_number"],
        data["tool_code"],
        data["status"],
        available,
        # data["available_for_service"],  # New field coming from frontend
        id
    ))

    # Insert into vehicle history as before
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

@app.route("/stats_range")
def stats_range():
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    query = "SELECT status, COUNT(*) AS count FROM vehicle_history WHERE 1=1"
    params = []

    if from_date:
        query += " AND DATE(timestamp) >= %s"
        params.append(from_date)

    if to_date:
        query += " AND DATE(timestamp) <= %s"
        params.append(to_date)

    query += " GROUP BY status"

    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return jsonify({r["status"]: r["count"] for r in rows})

@app.route("/health")
def health():
    return "OK"

@app.route("/admin")
def admin_dashboard():
    return render_template("admin.html")

@app.route("/vehicles-page")
def vehicles_page():
    return render_template("vehicles.html")

@app.route("/vehicles-stats")
def vehicles_stats():
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM vehicles
        GROUP BY status
    """)

    rows = cur.fetchall()
    conn.close()

    # Convert to dict like { "פעיל": 10, "נמכר": 5, ... }
    result = {row[0]: row[1] for row in rows}
    return jsonify(result)

# ---- Time Series Stats (per day) ----
@app.route("/stats_by_day")
def stats_by_day():
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    query = """
        SELECT DATE(timestamp) as day, COUNT(*) as total
        FROM vehicle_history
        WHERE 1=1
    """
    params = []

    if from_date:
        query += " AND DATE(timestamp) >= %s"
        params.append(from_date)
    if to_date:
        query += " AND DATE(timestamp) <= %s"
        params.append(to_date)

    query += " GROUP BY day ORDER BY day ASC"

    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return jsonify(rows)

@app.route("/reports_by_day")
def reports_by_day():
    date = request.args.get("date")

    if not date:
        return jsonify({"error":"date required"}), 400

    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        SELECT status, COUNT(*) as count
        FROM vehicle_history
        WHERE DATE(timestamp) = %s
        GROUP BY status
    """, (date,))

    rows = cur.fetchall()
    conn.close()

    return jsonify({r[0]: r[1] for r in rows})


@app.route("/upload_excel", methods=["POST"])
def upload_excel():
    if "user" not in session or session["user"]["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        df = pd.read_excel(file)

        required_columns = ["license_number", "tool_code", "status"]

        for col in required_columns:
            if col not in df.columns:
                return jsonify({"error": f"Missing column: {col}"}), 400

        conn = connect()
        cur = conn.cursor()

        for _, row in df.iterrows():

            available = True  # default = ניתן

            if "available_for_service" in df.columns:
                value = str(row["available_for_service"]).strip().lower()

                if value in ["false", "0", "לא ניתן", "no"]:
                    available = False

            cur.execute("""
                INSERT INTO vehicles
                (license_number, tool_code, status, available_for_service)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (license_number) DO UPDATE
                SET tool_code = EXCLUDED.tool_code,
                    status = EXCLUDED.status,
                    available_for_service = EXCLUDED.available_for_service
            """, (
                str(row["license_number"]).strip(),
                str(row["tool_code"]).strip(),
                str(row["status"]).strip(),
                available
            ))

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#test rout
# @app.route("/fix-db")
# def fix_db():
#     conn = connect()
#     cur = conn.cursor()

#     cur.execute("""
#         ALTER TABLE vehicles
#         ADD COLUMN IF NOT EXISTS available_for_service BOOLEAN DEFAULT TRUE;
#     """)

#     cur.execute("""
#         UPDATE vehicles
#         SET available_for_service = TRUE
#         WHERE available_for_service IS NULL;
#     """)

#     cur.execute("""
#         ALTER TABLE vehicles
#         ALTER COLUMN available_for_service SET NOT NULL;
#     """)

#     conn.commit()
#     conn.close()

#     return "DB fixed successfully"

# ---------------- RUN ----------------

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)

#test
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
