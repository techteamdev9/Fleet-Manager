def init_db():
    conn = connect()
    cur = conn.cursor()

    # ---------------- Users table ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20),  -- keep for legacy, optional
        permission_id INT DEFAULT 2
    )
    """)  # i changed this: SQLite syntax -> MySQL compatible

    # ---------------- Permissions table ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    )
    """)  # i changed this: MySQL compatible

    # Insert default permissions safely
    cur.execute("SELECT COUNT(*) FROM permissions")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO permissions (id, name) VALUES (1, 'admin'), (2, 'user')")
        # i changed this: replaced INSERT OR IGNORE with safe check

    # ---------------- Vehicles table ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_number VARCHAR(50) NOT NULL,
        tool_code VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
    )
    """)  # i changed this: MySQL compatible

    # ---------------- Vehicle history table ----------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
    """)  # i changed this: MySQL compatible

    # ---------------- Default users ----------------
    # Check if admin exists
    cur.execute("SELECT COUNT(*) FROM users WHERE username='admin'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users (username, password, role, permission_id) VALUES (%s, %s, %s, %s)",
                    ("admin", "admin123", "admin", 1))  # i changed this: MySQL %s placeholders

    # Check if regular user exists
    cur.execute("SELECT COUNT(*) FROM users WHERE username='user'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users (username, password, role, permission_id) VALUES (%s, %s, %s, %s)",
                    ("user", "user123", "user", 2))  # i changed this: MySQL %s placeholders

    conn.commit()
    conn.close()
