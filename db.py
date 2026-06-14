import os
import time
import psycopg2
from dotenv import load_dotenv
load_dotenv()

def connect(retries=5, delay=2):
    """Tries to connect to the database, retrying on failure."""
    DATABASE_URL = os.getenv("DATABASE_URL")  # 🔁 CHANGED (Render)
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