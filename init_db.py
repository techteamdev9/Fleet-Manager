from db import connect
print("init_db.py loaded")
def init_db():
    conn = connect()
    cur = conn.cursor()
    print("🟡 Running init_db...")


    # ---------------- Users table ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20),  -- keep for legacy, optional
        permission_id INT DEFAULT 2
    )
    """)  # i changed this: SQLite syntax -> MySQL compatible

    # ---------------- Permissions table ----------------
    cur.execute("""
    CREATE TABLE 
    IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    )
    """)  # i changed this: MySQL compatible

    # Insert default permissions safely
    cur.execute("SELECT COUNT(*) FROM permissions")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO permissions (id, name) VALUES (1, 'admin'), (2, 'user')")
        # i changed this: replaced INSERT OR IGNORE with safe check

    # ---------------- Vehicles table ----------------
   # ---------------- Vehicles ----------------
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS vehicles (
#     id SERIAL PRIMARY KEY,
#     license_number VARCHAR(50) UNIQUE NOT NULL,
#     tool_code VARCHAR(50) NOT NULL,
#     status VARCHAR(50) NOT NULL,
#     available_for_service BOOLEAN DEFAULT TRUE,
#     unitCode VARCHAR(50),
#     category VARCHAR(50),
#     vehicle_type VARCHAR(50),
#     sub_type VARCHAR(50),
#     owner_type VARCHAR(50),
#     lease_name VARCHAR(100),
#     images TEXT[] DEFAULT '{}'
# );
#     """)
    cur.execute("""CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,

        license_number VARCHAR(50) UNIQUE NOT NULL,

        tool_code VARCHAR(50),
        status VARCHAR(50) NOT NULL,

        available_for_service BOOLEAN DEFAULT TRUE,

        unitCode VARCHAR(50),
        category VARCHAR(50),
        vehicle_type VARCHAR(50),
        sub_type VARCHAR(50),
        owner_type VARCHAR(50),
        lease_name VARCHAR(100),

        owner_name TEXT,
        owner_id TEXT,
        owner_phone TEXT,

        location TEXT,

        fuel TEXT,
        licence_status TEXT,

        images TEXT[] DEFAULT '{}',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
""")
  # i changed this: MySQL compatible

    # ---------------- Vehicle history table ----------------
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vehicle_history (
        id SERIAL PRIMARY KEY,
        vehicle_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
    """)  # i changed this: MySQL compatible

    # ---------------- Default users ----------------
    # Check if admin exists
    cur.execute("SELECT COUNT(*) FROM users WHERE username='admin'")
    if  cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users (username, password, role, permission_id) VALUES (%s, %s, %s, %s)",
                    ("admin", "admin123", "admin", 1))  # i changed this: MySQL %s placeholders

    # Check if regular user exists
    cur.execute("SELECT COUNT(*) FROM users WHERE username='user'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users (username, password, role, permission_id) VALUES (%s, %s, %s, %s)",
                    ("user", "user123", "user", 2))  # i changed this: MySQL %s placeholders
    
#650
    cur.execute("""
    CREATE TABLE IF NOT EXISTS form_650 (
    id SERIAL PRIMARY KEY,

    vehicle_id INTEGER REFERENCES vehicles(id),

    vehicle_number TEXT NOT NULL,

    event_type TEXT,

    vehicle_type TEXT,

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
    cur.close()
    conn.close()
print("✅ Tables created")
