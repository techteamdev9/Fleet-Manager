from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from init_db import init_db
import pandas as pd
import os
import time
import json
import requests
# ---------------- CONFIG ----------------
#just for local
#from dotenv import load_dotenv
#load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # 🔁 CHANGED (Render)
print("🔵 CONNECTING TO DB:", DATABASE_URL)
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

#excel upload const 
COLUMN_MAP = {
    'מס"ד': 'excel_index',
    'מספר רישוי': 'license_number',
    'סוג אמצעי גיוס': 'recruitment_type',
    'קבוצת אב-מנהלים': 'manager_group',
    'סוג רכב משרד התחבורה': 'vehicle_type',

    'סוג בעלות - חברה/ פרטי': 'ownership_type',
    'שם חברת ליסינג/השכרה \n(אם רלוונטי)': 'leasing_company',
    'ירמ"א אחראית\n(אגד לאו"ם)': 'responsible_yerma',

    'תאריך גיוס': 'recruitment_date',
    'פעימת שחרור': 'release_batch',
    'סיבת שחרור': 'release_reason',
    'תאריך פקודה לשחרור': 'release_order_date',

    'פיקוד אחראי': 'responsible_command',
    'שייכות (תחת הפיקוד)': 'affiliation',
    'יחידה מזדכה': 'credited_unit',

    'תאריך זיכוי': 'credit_date',
    'תאריך שחרור': 'release_date',

    'סטאטוס': 'excel_status',
    'הערות': 'notes',

    'מספר רישוי נקי ללא אותיות': 'clean_license_number'
}
def addsome():
    conn = connect()
    cur = conn.cursor()

#     # cur.execute("""
#     # ALTER TABLE vehicles
#     # ADD COLUMN IF NOT EXISTS category VARCHAR(50),
#     # ADD COLUMN IF NOT EXISTS tool_code VARCHAR(50),
#     # ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
#     # ADD COLUMN IF NOT EXISTS sub_type VARCHAR(50),
#     # ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50),
#     # ADD COLUMN IF NOT EXISTS lease_name VARCHAR(100),
#     # ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
#     # """)  
#     # cur.execute("""
#     # ALTER TABLE vehicles
#     # ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
#     # """)



    cur.execute("""
    CREATE TABLE IF NOT EXISTS form_650 (
       id SERIAL PRIMARY KEY,
       event_type TEXT,
       vehicle_type TEXT,
       vehicle_number TEXT,
       date DATE,
       location TEXT,
       owner_name TEXT,
       owner_id TEXT,
       owner_phone TEXT,
       licence_status TEXT,
       fuel TEXT,
       checklist JSONB,
       lights TEXT,
       tires TEXT,
       damage_physical TEXT,
       damage_mechanical TEXT,
       assessor TEXT,
       document_person_id TEXT,
       releasing_signature TEXT,
       unit_rep TEXT,
       created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS issuing_forms (
        id SERIAL PRIMARY KEY,

        vehicle_number TEXT,

        issuing_unit TEXT,
        receiving_unit TEXT,

        items JSONB,
        accessories JSONB,
        signatures JSONB,

        created_at TIMESTAMP DEFAULT NOW()
    );
    """)


    conn.commit()
    conn.close()
#addsome()

def alter_tables():
    conn =connect()
    cur = conn.cursor()

    cur.execute("""
        ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS locatorcode VARCHAR(50);

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS lockcode VARCHAR(50);

       ALTER TABLE form_650
ADD COLUMN IF NOT EXISTS locatorcode VARCHAR(50);

ALTER TABLE form_650
ADD COLUMN IF NOT EXISTS lockcode VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS excel_index INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS recruitment_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS manager_group TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ownership_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS leasing_company TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS responsible_yerma TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS recruitment_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS release_batch TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS release_reason TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS release_order_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS responsible_command TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS affiliation TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS credited_unit TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS credit_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS excel_status TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS clean_license_number TEXT;
    """)

    conn.commit()
    cur.close()
    conn.close()

    print("✅ Database columns checked/updated")
    #init_db()
#alter_tables()
# def init_db():
#     conn = connect()
#     cur = conn.cursor()

#     # ---------------- Permissions ----------------
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS permissions (
#         id INT PRIMARY KEY,
#         name VARCHAR(50) NOT NULL
#     )
#     """)

#     cur.execute("""
#     INSERT INTO permissions (id, name)
#     VALUES (1, 'admin'), (2, 'user')
#     ON CONFLICT (id) DO NOTHING
#     """)

#     # ---------------- Users ----------------
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS users (
#         id SERIAL PRIMARY KEY,
#         username VARCHAR(50) UNIQUE NOT NULL,
#         password VARCHAR(255) NOT NULL,
#         role VARCHAR(20),
#         permission_id INT REFERENCES permissions(id)
#     )
#     """)

#     # ---------------- Vehicles ----------------
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS vehicles (
#         id SERIAL PRIMARY KEY,
#         license_number VARCHAR(50) UNIQUE NOT NULL,
#         tool_code VARCHAR(50) NOT NULL,
#         status VARCHAR(50) NOT NULL
#     )
#     """)
   
#     # ---------------- Vehicle History ----------------
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS vehicle_history (
#         id SERIAL PRIMARY KEY,
#         vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
#         status VARCHAR(50) NOT NULL,
#         timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
#     )
#     """)

def add1():
    conn = connect()
    cur = conn.cursor()

    # # ---------------- Vehicles ----------------
    # cur.execute("""
    # CREATE TABLE IF NOT EXISTS vehicles (
    #     id SERIAL PRIMARY KEY,
    #     license_number VARCHAR(50) UNIQUE NOT NULL,
    #     tool_code VARCHAR(50) NOT NULL,
    #     status VARCHAR(50) NOT NULL
    # )
    # """)

    # # ✅ Ensure available_for_service column always exists
    # cur.execute("""
    # ALTER TABLE vehicles
    # ADD COLUMN IF NOT EXISTS available_for_service BOOLEAN DEFAULT TRUE;
    # """)


    # # ✅ Ensure old rows are TRUE (ניתן לגיוס)
    # cur.execute("""
    # UPDATE vehicles
    # SET available_for_service = TRUE
    # WHERE available_for_service IS NULL;
    # """)

    # # ✅ Prevent NULL in future
    # cur.execute("""
    # ALTER TABLE vehicles
    # ALTER COLUMN available_for_service SET NOT NULL;
    # """)
    # # cur.execute("""
    # # ALTER TABLE vehicles ADD COLUMN owner_name TEXT;

    # # """)


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
#add1()
   
# 🔥 run once on startup
# 🔥 Run database initialization safely
#print("Running init_db")
#init_db() #for manual init
#print("Running after init_db")

#alter table vehicle and form_650 w locator and lock once after init_db:
# def add_vehicle_columns():
#     conn = connect()  # replace with your DB file
#     cursor = conn.cursor()

#     try:
#         cursor.execute(
#             "ALTER TABLE form_650 ADD COLUMN locatorCode TEXT"
#         )
#     except Exception:
#         pass

#     try:
#         cursor.execute(
#             "ALTER TABLE form_650 ADD COLUMN lockCode TEXT"
#         )
#     except Exception:
#         pass

#     conn.commit()
#     conn.close()

# # Run once
# add_vehicle_columns()
# ---------------- ROUTES ----------------
#vehicle search:
RESOURCE_ID = "053cea08-09bc-40ec-8f7a-156f0677aff3"
@app.route("/api/vehicle-registry/manufacturers")
def get_manufacturers():

    try:

        url = "https://data.gov.il/api/3/action/datastore_search"

        all_records = []
        offset = 0
        limit = 3200  # CKAN max safe batch

        while True:

            params = {
                "resource_id": RESOURCE_ID,
                "limit": limit,
                "offset": offset
            }

            res = requests.get(url, params=params, timeout=30)
            data = res.json()

            records = data.get("result", {}).get("records", [])

            if not records:
                break

            all_records.extend(records)

            offset += limit

            # safety stop (prevents infinite loop)
            if offset > 200000:
                break

        manufacturers = sorted(set(
            r.get("tozeret_nm") for r in all_records if r.get("tozeret_nm")
        ))

        return jsonify({
        "success": True,
        "manufacturers": manufacturers
        }), 200, {
        "Content-Type": "application/json; charset=utf-8"
        }

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
@app.route("/api/vehicle-registry/filter-search", methods=["POST"])
def filter_search_vehicle_registry():

    try:
        filters = request.json or {}

        base_filters = {}

        # VEHICLE TYPE (IMPORTANT FIX)
        if filters.get("vehicle_type"):
            base_filters["sug_degem"] = filters["vehicle_type"]

        # OWNER TYPE
        if filters.get("owner_type"):
            base_filters["baalut"] = filters["owner_type"]

        # MANUFACTURER
        if filters.get("manufacturer"):
            base_filters["tozeret_nm"] = filters["manufacturer"]

        # MODEL
        if filters.get("model"):
            base_filters["kinuy_mishari"] = filters["model"]

        # FUEL
        if filters.get("fuel"):
            base_filters["sug_delek_nm"] = filters["fuel"]

        # YEAR
        if filters.get("year"):
            base_filters["shnat_yitzur"] = int(filters["year"])

        limit = int(filters.get("limit") or 50)

        params = {
            "resource_id": RESOURCE_ID,
            "filters": json.dumps(base_filters, ensure_ascii=False),
            "limit": limit
        }

        response = requests.get(
            "https://data.gov.il/api/3/action/datastore_search",
            params=params,
            timeout=20
        )

        data = response.json()

        records = data.get("result", {}).get("records", [])

        return jsonify({
            "success": True,
            "vehicles": records
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/api/vehicle-registry/<string:license_number>")
def vehicle_registry(license_number):

    try:

        url = "https://data.gov.il/api/3/action/datastore_search"

        params = {
            "resource_id": RESOURCE_ID,
            "filters": f'{{"mispar_rechev":"{license_number}"}}',
            "limit": 1
        }

        response = requests.get(
            url,
            params=params,
            timeout=15
        )

        data = response.json()

        records = data.get("result", {}).get("records", [])

        if not records:
            return jsonify({
                "success": False,
                "message": "לא נמצא רכב"
            })

        return jsonify({
            "success": True,
            "vehicle": records[0]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
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
# @app.route("/drop-vehicles")
# def drop_vehicles():
#     conn = connect()
#     cur = conn.cursor()

#     cur.execute("DROP TABLE IF EXISTS vehicles CASCADE;")

#     conn.commit()
#     conn.close()

#     return "vehicles table dropped"
# @app.route("/drop-form650")
# def drop_form650():
#     conn = connect()
#     cur = conn.cursor()

#     cur.execute("DROP TABLE IF EXISTS form_650 CASCADE;")

#     conn.commit()
#     conn.close()

#     return "form_650 dropped"

#deleted 19/07/26
# @app.route("/vehicles", methods=["GET"])
# def get_vehicles():
#     from_date = request.args.get("from_date")
#     to_date = request.args.get("to_date")
#     q = request.args.get("q")

#     conn = connect()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     # ---- SEARCH + DATE FILTER ----
#     if from_date and to_date:
#         query = """
#             SELECT DISTINCT v.*
#             FROM vehicles v
#             JOIN vehicle_history vh ON vh.vehicle_id = v.id
#             WHERE DATE(vh.timestamp) >= %s
#               AND DATE(vh.timestamp) <= %s
#         """
#         params = [from_date, to_date]

#         if q:
#             query += """
#               AND (
#                   v.license_number ILIKE %s OR
#                   v.tool_code ILIKE %s OR
#                   v.status ILIKE %s
#               )
#             """
#             params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])

#         query += " ORDER BY v.id ASC"
#         cur.execute(query, params)

#     # ---- SEARCH ONLY ----
#     elif q:
#         query = """
#             SELECT *
#             FROM vehicles
#             WHERE license_number ILIKE %s
#                OR tool_code ILIKE %s
#                OR status ILIKE %s
#             ORDER BY id ASC
#         """
#         cur.execute(query, (f"%{q}%", f"%{q}%", f"%{q}%"))

#     # ---- NO FILTERS ----
#     else:
#         cur.execute("""
# SELECT
#     id,
#     license_number,
#     tool_code,
#     status,
#     available_for_service,
#     unitcode,
#     owner_name,
#     owner_id,
#     owner_phone,
#     locatorcode,
#     lockcode,
#     category,
#     vehicle_type,
#     sub_type,
#     owner_type,
#     lease_name,
#     location,
#     fuel,
#     licence_status,
#     created_at,
#     updated_at,
#     images
# FROM vehicles
# ORDER BY id ASC;
# """)

#     rows = cur.fetchall()
#     conn.close()

#     return jsonify(rows)
@app.route("/summary")
def summary():
    return render_template("summary.html")
    
@app.route("/vehicles", methods=["GET"])
def get_vehicles():
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    q = request.args.get("q")

    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
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
                      v.clean_license_number ILIKE %s OR
                      v.tool_code ILIKE %s OR
                      v.status ILIKE %s OR
                      v.excel_status ILIKE %s OR
                      v.vehicle_type ILIKE %s OR
                      v.unitcode ILIKE %s OR
                      v.responsible_command ILIKE %s
                  )
                """

                params.extend([
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%",
                    f"%{q}%"
                ])

            query += " ORDER BY v.id ASC"

            cur.execute(query, params)

        # ---- SEARCH ONLY ----
        elif q:
            query = """
                SELECT *
                FROM vehicles
                WHERE license_number ILIKE %s
                   OR clean_license_number ILIKE %s
                   OR tool_code ILIKE %s
                   OR status ILIKE %s
                   OR excel_status ILIKE %s
                   OR vehicle_type ILIKE %s
                   OR unitcode ILIKE %s
                   OR responsible_command ILIKE %s
                ORDER BY id ASC
            """

            cur.execute(query, (
                f"%{q}%",
                f"%{q}%",
                f"%{q}%",
                f"%{q}%",
                f"%{q}%",
                f"%{q}%",
                f"%{q}%",
                f"%{q}%"
            ))

        # ---- NO FILTERS ----
        else:
            cur.execute("""
                SELECT
                    id,
                    excel_index,
                    license_number,
                    clean_license_number,
                    tool_code,

                    status,
                    excel_status,
                    available_for_service,

                    unitcode,

                    owner_name,
                    owner_id,
                    owner_phone,

                    locatorcode,
                    lockcode,

                    category,
                    vehicle_type,
                    sub_type,
                    owner_type,
                    lease_name,

                    recruitment_type,
                    manager_group,
                    ownership_type,
                    leasing_company,
                    responsible_yerma,

                    recruitment_date,
                    release_batch,
                    release_reason,
                    release_order_date,

                    responsible_command,
                    affiliation,
                    credited_unit,

                    credit_date,
                    release_date,

                    notes,

                    location,
                    fuel,
                    licence_status,

                    created_at,
                    updated_at,

                    images

                FROM vehicles
                ORDER BY id ASC;
            """)

        rows = cur.fetchall()

        return jsonify(rows)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


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
    cur.execute("DELETE FROM form_650 WHERE vehicle_id = %s", (id,))
    cur.execute("DELETE FROM vehicles WHERE id = %s", (id,))
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


# @app.route("/upload_excel", methods=["POST"])
# def upload_excel():
#     if "user" not in session or session["user"]["role"] != "admin":
#         return jsonify({"error": "Unauthorized"}), 403

#     if "file" not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files["file"]

#     try:
#         df = pd.read_excel(file)
#         df.rename(columns=COLUMN_MAP, inplace=True)

#         # required_columns = ["license_number", "tool_code", "status"]

#         # for col in required_columns:
#         #     if col not in df.columns:
#         #         return jsonify({"error": f"Missing column: {col}"}), 400
# required_columns = ["license_number"]

# for col in required_columns:
#     if col not in df.columns:
#         return jsonify({"error": f"Missing column: {col}"}), 400
#         conn = connect()
#         cur = conn.cursor()

#         for _, row in df.iterrows():

#             available = True  # default = ניתן

#             if "available_for_service" in df.columns:
#                 value = str(row["available_for_service"]).strip().lower()

#                 if value in ["false", "FALSE", "0", "לא ניתן", "no"]:
#                     available = False

#             unitcode_value = str(row["unitcode"]).strip() if "unitcode" in df.columns else None

#             cur.execute("""
#                 INSERT INTO vehicles
#                 (license_number, tool_code, status, available_for_service, unitcode)
#                 VALUES (%s, %s, %s, %s, %s)
#                 ON CONFLICT (license_number) DO UPDATE
#                 SET tool_code = EXCLUDED.tool_code,
#                     status = EXCLUDED.status,
#                     available_for_service = EXCLUDED.available_for_service,
#                     unitcode = COALESCE(EXCLUDED.unitcode, vehicles.unitcode)
#             """, (
#                 str(row["license_number"]).strip(),
#                 str(row["tool_code"]).strip(),
#                 str(row["status"]).strip(),
#                 available,
#                 unitcode_value
#             ))

#         conn.commit()
#         conn.close()

#         return jsonify({"success": True})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
@app.route("/upload_excel", methods=["POST"])
def upload_excel():
    if "user" not in session or session["user"]["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        filename = file.filename.lower()

        # Read Excel or Excel Binary
        if filename.endswith(".xlsb"):
            df = pd.read_excel(file, engine="pyxlsb")
        else:
            df = pd.read_excel(file)
            print("Original Excel headers:")
            print(df.columns.tolist())

        # Rename Hebrew Excel headers to database columns
        # Rename Excel headers to database columns
        print("BEFORE RENAME:")
        print(df.columns.tolist())
        df.rename(columns=COLUMN_MAP, inplace=True)
        print("excel_index values:")
        print(df["excel_index"].head(20).to_string())
        # DEBUG - check renamed columns
        print("AFTER RENAME COLUMNS:")
        for col in df.columns:
            print(repr(col))

        print("Sample imported values:")

        # Save original DataFrame for debugging
        # df_original = df.copy()

        # Make sure required column exists
        if "license_number" not in df.columns:
            return jsonify({"error": "Missing column: license_number"}), 400        
        # -----------------------------
        # CLEAN EMPTY EXCEL ROWS
        # -----------------------------
        print("Rows before cleanup:", len(df))
        # Remove spaces from text fields
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
        # Convert empty strings to None
        df = df.replace("", None)

        # Remove rows where everything is empty
        df.dropna(how="all", inplace=True)

        # Keep only rows with license number
        df = df[
            df["license_number"].notna()
        ]

        # Remove blank license numbers
        df = df[
            df["license_number"].astype(str).str.strip() != ""
        ]

        # Remove text "nan"
        df = df[
            df["license_number"].astype(str).str.lower() != "nan"
        ]


        print("Rows after cleanup:", len(df))
        # TEST ONLY
        # TEST ONLY - import first 100 rows
        df = df.head(100)

        print("Rows to import:", len(df))       
        # removed = df_original[~df_original["license_number"].notna()]
        # print(removed)
        # DEBUG - show last 50 license numbers
        # print("Last 50 license numbers:")
        print(df["license_number"].tail(50).to_string())


        # -----------------------------
        # CONVERT DATES
        # -----------------------------

        date_columns = [
            "recruitment_date",
            "release_order_date",
            "credit_date",
            "release_date"
        ]

        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(
                    df[col],
                    unit="D",
                    origin="1899-12-30",
                    errors="coerce"
                ).dt.date


        # Final cleanup for PostgreSQL
        df = df.replace({pd.NaT: None})
        df = df.where(pd.notnull(df), None)


        conn = connect()
        cur = conn.cursor()

        inserted_count = 0


        for index, row in df.iterrows():

            # Extra protection
            if not row.get("license_number"):
                continue


            if inserted_count % 100 == 0:
                print(f"Inserted {inserted_count} rows")


            cur.execute("""
                INSERT INTO vehicles (
                    license_number,
                    status,
                    excel_index,
                    recruitment_type,
                    manager_group,
                    vehicle_type,
                    ownership_type,
                    leasing_company,
                    responsible_yerma,
                    recruitment_date,
                    release_batch,
                    release_reason,
                    release_order_date,
                    responsible_command,
                    affiliation,
                    credited_unit,
                    credit_date,
                    release_date,
                    excel_status,
                    notes,
                    clean_license_number
                )
                VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )

                ON CONFLICT (license_number)

DO UPDATE SET
    status = EXCLUDED.status,
    excel_index = EXCLUDED.excel_index,
    recruitment_type = EXCLUDED.recruitment_type,
    manager_group = EXCLUDED.manager_group,
    vehicle_type = EXCLUDED.vehicle_type,
    ownership_type = EXCLUDED.ownership_type,
    leasing_company = EXCLUDED.leasing_company,
    responsible_yerma = EXCLUDED.responsible_yerma,
    recruitment_date = EXCLUDED.recruitment_date,
    release_batch = EXCLUDED.release_batch,
    release_reason = EXCLUDED.release_reason,
    release_order_date = EXCLUDED.release_order_date,
    responsible_command = EXCLUDED.responsible_command,
    affiliation = EXCLUDED.affiliation,
    credited_unit = EXCLUDED.credited_unit,
    credit_date = EXCLUDED.credit_date,
    release_date = EXCLUDED.release_date,
    excel_status = EXCLUDED.excel_status,
    notes = EXCLUDED.notes,
    clean_license_number = EXCLUDED.clean_license_number,
    updated_at = CURRENT_TIMESTAMP

            """, (
                str(row["license_number"]).strip() if row["license_number"] else None,
                row.get("excel_status"),
                row.get("excel_index"),
                row.get("recruitment_type"),
                row.get("manager_group"),
                row.get("vehicle_type"),
                row.get("ownership_type"),
                row.get("leasing_company"),
                row.get("responsible_yerma"),
                row.get("recruitment_date"),
                row.get("release_batch"),
                row.get("release_reason"),
                row.get("release_order_date"),
                row.get("responsible_command"),
                row.get("affiliation"),
                row.get("credited_unit"),
                row.get("credit_date"),
                row.get("release_date"),
                row.get("excel_status"),
                row.get("notes"),
                row.get("clean_license_number"),
            ))

            inserted_count += 1


        conn.commit()

        cur.close()
        conn.close()


        print("Final inserted:", inserted_count)

        return jsonify({
            "success": True,
            "inserted": inserted_count
        })


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

###########650###########################
# @app.route("/submit650", methods=["POST"])
# def submit_650():
#     data = request.json
#     print(data)
#     return {"status": "ok"}
@app.route("/form650")
def form650():
    return render_template("form650.html")

@app.route("/save-form-650", methods=["POST"])
def save_form_650():

    data = request.json

   
    conn = connect()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO form_650 (
            event_type,
            vehicle_type,
            vehicle_number,
            date,
            location
        )
        VALUES (%s,%s,%s,%s,%s)
    """, (
        data["event_type"],
        data["vehicle_type"],
        data["vehicle_number"],
        data["date"],
        data["location"]
    ))

    conn.commit()

  
    cur.close()
    conn.close()

    return jsonify({"status": "ok"})
    #test forms db
@app.route("/test-db")
def test_db():
    conn = connect()
    cur = conn.cursor()

    cur.execute("SELECT * FROM form_650 LIMIT 1;")
    return {"status": "ok"}

@app.route("/save-issuing-form", methods=["POST"])
def save_issuing():
    conn = connect()
    cur = conn.cursor()
    data = request.json
#  vehicle_number,
    cur.execute("""
        INSERT INTO issuing_forms (

            issuing_unit,
            receiving_unit,
            items,
            accessories,
            signatures
        )
        VALUES (%s,%s,%s,%s,%s)
    """, (
        # data["vehicle_number"],
        data["issuing_unit"],
        data["receiving_unit"],
        json.dumps(data["items"]),
        json.dumps(data["accessories"]),
        json.dumps(data["signatures"])
    ))

    conn.commit()
    conn.close()
    print(data)
    return jsonify({"status": "ok"})


@app.route("/get-forms-650")
def get_forms_650():
    conn = connect()
    cur = conn.cursor()

    cur.execute("SELECT * FROM form_650 ORDER BY id DESC;")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {"data": rows}
# @app.route("/save-issue-form", methods=["POST"])
# def save_issue_form():
#     data = request.get_json()

#     print(data)  # test first

#     return jsonify({"status": "ok"})
@app.route("/submit-form", methods=["POST"])
def submit_form():

    data = request.json
    date_value = data["date"] if data["date"] else None
    event_type = data["event_type"]
    vehicle_number = data["vehicle_number"]

    conn = connect()
    cur = conn.cursor()

    # --------------------------------
    # CHECK IF VEHICLE EXISTS
    # --------------------------------

    cur.execute("""
        SELECT id FROM vehicles
        WHERE license_number = %s
    """, (vehicle_number,))

    vehicle = cur.fetchone()

    # --------------------------------
    # ADD VEHICLE
    # --------------------------------

    if event_type == "גיוס הרכב":

        if vehicle:
            return jsonify({
                "message": "Vehicle already exists"
            }), 400

        cur.execute("""
   INSERT INTO vehicles (
        license_number,
        status,
        vehicle_type,
        owner_name,
        owner_id,
        owner_phone,
        locatorcode,
        lockcode,
        location,
        fuel,
        licence_status
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
""", (
    vehicle_number,
    "מגוייס",
    data.get("vehicle_type"),
    data.get("owner_name"),
    data.get("owner_id"),
    data.get("owner_phone"),
    data.get("locatorcode"),
    data.get("lockcode"),
    data.get("location"),
    data.get("fuel"),
    data.get("licence_status")
))

        vehicle_id = cur.fetchone()[0]

    # --------------------------------
    # UPDATE VEHICLE
    # --------------------------------

    else:

        if not vehicle:
            return jsonify({
                "message": "Vehicle not found"
            }), 404

        vehicle_id = vehicle[0]

        new_status = ""

        if event_type == "שחרור לבעלים":
            new_status = "שוחרר"

        elif event_type == "זיכוי מיחידת הסמך":
            new_status = "זיכוי"

        cur.execute("""
            UPDATE vehicles
            SET
                status = %s,
                owner_name = %s,
                owner_id = %s,
                owner_phone = %s,
                locatorcode= %s,
                lockcode= %s,
                location = %s,
                fuel = %s,
                licence_status = %s,
                updated_at = NOW()
            WHERE id = %s
        """, (
            new_status,
            data["owner_name"],
            data["owner_id"],
            data["owner_phone"],
            data["locatorcode"],
            data["lockcode"],
            data["location"],
            data["fuel"],
            data["licence_status"],
            vehicle_id
        ))

    # --------------------------------
    # SAVE FORM
    # --------------------------------
    cur.execute("""
        INSERT INTO form_650 (
            vehicle_id,
            vehicle_number,
            event_type,
            vehicle_type,
            date,
            location,
            owner_name,
            owner_id,
            owner_phone,
            locatorcode,
            lockcode,
            licence_status,
            fuel
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        vehicle_id,
        vehicle_number,
        data["event_type"],
        data["vehicle_type"],
        date_value,
        data["location"],
        data["owner_name"],
        data["owner_id"],
        data["owner_phone"],
        data["locatorcode"],
        data["lockcode"],
        data["licence_status"],
        data["fuel"]
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Form submitted successfully"
    })
    
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

#cur.execute("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS unitcode VARCHAR(50);")
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
    #init_db()
    app.run(host="0.0.0.0", port=port)
