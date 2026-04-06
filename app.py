from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pandas as pd
import os
import time

# ---------------- CONFIG ----------------
#just for local
# from dotenv import load_dotenv
# load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # 🔁 CHANGED (Render)

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY") or "devsecret"
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


def init_db():
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
    ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS category VARCHAR(50),
    ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS sub_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS lease_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
    """)  

    conn.commit()
    conn.close()

   
# 🔥 run once on startup
# 🔥 Run database initialization safely
#init_db() #for manual init
# ---------------- ROUTES ----------------

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/events-page")
def events_page():
    return render_template("events.html")

@app.route("/users-page")
def users_page():
    return render_template("users_management.html")

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

    session["user"] = {
    "username": user[0],
    "role": user[1].lower()
}
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
        cur.execute("""
            SELECT   id,
            license_number,
            tool_code,
            status,
            available_for_service,
            unitcode,
            category,
            vehicle_type,
            sub_type,
            owner_type,
            lease_name,
            images FROM vehicles ORDER BY id ASC
        """)

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
        INSERT INTO vehicles (license_number, tool_code, unitcode, status, available_for_service)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data["license_number"],
        data["tool_code"],
        data["unitcode"],   # new field
        data["status"],
        available
    ))

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
        unitcode = %s,
        status = %s,
        vehicle_type = %s,
        available_for_service = %s
    WHERE id = %s
    """, (
    data["license_number"],
    data["tool_code"],
    data["unitcode"],
    data["status"],
    data["vehicle_type"],
    available,
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
    return render_template("vehicles.html")  # "vehicles.html"

@app.route("/vehicles-page1")
def vehicles_page1():
    return render_template("VehicleScreen.html")  # "vehicles.html" 

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

                if value in ["false", "FALSE", "0", "לא ניתן", "no"]:
                    available = False

            unitcode_value = str(row["unitcode"]).strip() if "unitcode" in df.columns else None

            cur.execute("""
                INSERT INTO vehicles
                (license_number, tool_code, status, available_for_service, unitcode)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (license_number) DO UPDATE
                SET tool_code = EXCLUDED.tool_code,
                    status = EXCLUDED.status,
                    available_for_service = EXCLUDED.available_for_service,
                    unitcode = COALESCE(EXCLUDED.unitcode, vehicles.unitcode)
            """, (
                str(row["license_number"]).strip(),
                str(row["tool_code"]).strip(),
                str(row["status"]).strip(),
                available,
                unitcode_value
            ))

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/check_session")
def check_session():
    return jsonify(dict(session))

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

# ---------------- EVENTS ----------------

def ensure_events_table():
    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            event_type VARCHAR(50) DEFAULT 'general',
            severity VARCHAR(20) DEFAULT 'info',
            vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
            created_by VARCHAR(50),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

try:
    ensure_events_table()
except Exception as e:
    print("Could not ensure events table:", e)

@app.route("/events", methods=["GET"])
def get_events():
    q          = request.args.get("q", "")
    event_type = request.args.get("event_type", "")
    severity   = request.args.get("severity", "")
    from_date  = request.args.get("from_date", "")
    to_date    = request.args.get("to_date", "")

    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Application Security Requirement: parameterized queries, boundary validation
    query = """
        SELECT e.*, v.license_number AS vehicle_license
        FROM events e
        LEFT JOIN vehicles v ON e.vehicle_id = v.id
        WHERE 1=1
    """
    params = []

    if q:
        query += " AND (e.title ILIKE %s OR e.description ILIKE %s)"
        params.extend([f"%{q}%", f"%{q}%"])
    if event_type:
        query += " AND e.event_type = %s"
        params.append(event_type)
    if severity:
        query += " AND e.severity = %s"
        params.append(severity)
    if from_date:
        query += " AND DATE(e.created_at) >= %s"
        params.append(from_date)
    if to_date:
        query += " AND DATE(e.created_at) <= %s"
        params.append(to_date)

    query += " ORDER BY e.created_at DESC"
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)


@app.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT e.*, v.license_number AS vehicle_license
        FROM events e
        LEFT JOIN vehicles v ON e.vehicle_id = v.id
        WHERE e.id = %s
    """, (event_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row)


@app.route("/events", methods=["POST"])
def add_event():
    data = request.json
    title      = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    event_type = str(data.get("event_type", "general")).strip()
    severity   = str(data.get("severity", "info")).strip()
    vehicle_id = data.get("vehicle_id") or None
    created_by = str(data.get("created_by", "")).strip() or "system"

    if not title:
        return jsonify({"error": "title required"}), 400

    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO events (title, description, event_type, severity, vehicle_id, created_by)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (title, description, event_type, severity, vehicle_id, created_by))
    new_id = cur.fetchone()[0]
    conn.commit()
    conn.close()
    return jsonify({"id": new_id, "message": "Event created"})


@app.route("/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    data = request.json
    title      = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    event_type = str(data.get("event_type", "general")).strip()
    severity   = str(data.get("severity", "info")).strip()
    vehicle_id = data.get("vehicle_id") or None

    if not title:
        return jsonify({"error": "title required"}), 400

    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        UPDATE events
        SET title=%s, description=%s, event_type=%s, severity=%s, vehicle_id=%s
        WHERE id=%s
    """, (title, description, event_type, severity, vehicle_id, event_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Event updated"})


@app.route("/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    conn = connect()
    cur = conn.cursor()
    cur.execute("DELETE FROM events WHERE id=%s", (event_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# ---------------- USERS MANAGEMENT ----------------

@app.route("/users", methods=["GET"])
def get_users():
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT u.id, u.username, u.role, u.permission_id, p.name AS permission_name
        FROM users u
        JOIN permissions p ON u.permission_id = p.id
        ORDER BY u.id ASC
    """)
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)


@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT u.id, u.username, u.role, u.permission_id, p.name AS permission_name
        FROM users u
        JOIN permissions p ON u.permission_id = p.id
        WHERE u.id = %s
    """, (user_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row)


@app.route("/users", methods=["POST"])
def add_user():
    data = request.json
    username      = str(data.get("username", "")).strip()
    password      = str(data.get("password", "")).strip()
    role          = str(data.get("role", "")).strip()
    permission_id = int(data.get("permission_id", 2))

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO users (username, password, role, permission_id)
            VALUES (%s, %s, %s, %s)
        """, (username, password, role, permission_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": "Username already exists"}), 409
    conn.close()
    return jsonify({"message": "User created"})


@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    role          = str(data.get("role", "")).strip()
    permission_id = int(data.get("permission_id", 2))
    password      = data.get("password", "")

    conn = connect()
    cur = conn.cursor()
    if password:
        cur.execute("""
            UPDATE users SET role=%s, permission_id=%s, password=%s WHERE id=%s
        """, (role, permission_id, str(password).strip(), user_id))
    else:
        cur.execute("""
            UPDATE users SET role=%s, permission_id=%s WHERE id=%s
        """, (role, permission_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "User updated"})


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = connect()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id=%s", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

conn = connect()
cur = conn.cursor()

cur.execute("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS unitcode VARCHAR(50);")
conn.commit()

conn = connect()
cur = conn.cursor()

# 1. Check if the table exists
cur.execute("""
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'vehicles'
    );
""")
exists = cur.fetchone()[0]

if exists:
    print("Vehicles table exists. Contents:")
    # 2. Fetch all rows
    cur.execute("SELECT * FROM vehicles;")
    rows = cur.fetchall()
    for row in rows:
        print(row)
else:
    print("Vehicles table does NOT exist!")

cur.close()
conn.close()
# ---------------- RUN ----------------

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)

#test
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
