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

    unitcode VARCHAR(50),
    owner_name TEXT,
    owner_id TEXT,
    owner_phone TEXT,

    locatorcode VARCHAR(50),
    lockcode VARCHAR(50),

    category VARCHAR(50),
    vehicle_type VARCHAR(50),
    sub_type VARCHAR(50),
    owner_type VARCHAR(50),
    lease_name VARCHAR(100),

    location TEXT,
    fuel TEXT,
    licence_status TEXT,

    -- Excel fields
    excel_index INTEGER,
    recruitment_type TEXT,
    manager_group TEXT,
    ownership_type TEXT,
    leasing_company TEXT,
    responsible_yerma TEXT,
    recruitment_date DATE,
    release_batch TEXT,
    release_reason TEXT,
    release_order_date DATE,
    responsible_command TEXT,
    affiliation TEXT,
    credited_unit TEXT,
    credit_date DATE,
    release_date DATE,
    excel_status TEXT,
    notes TEXT,
    clean_license_number TEXT,

    images TEXT[] DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""")
    # cur.execute("""ALTER TABLE vehicles
    # ADD COLUMN locatorcode VARCHAR(50);

    # ALTER TABLE vehicles
    # ADD COLUMN lockcode VARCHAR(50);""")


    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_history (
    id SERIAL PRIMARY KEY,

    vehicle_id INTEGER NOT NULL,

    status VARCHAR(50) NOT NULL,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(id)
    ON DELETE CASCADE);""")


    conn.commit()
    cur.close()
    conn.close()
print("✅ Tables created")
