import sqlite3
import os

db_path = "d:/WORK/CRIC PRO/cricket_tournament.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admins;")
        rows = cursor.fetchall()
        if not rows:
            print("No admins found in the database.")
        else:
            for row in rows:
                print(row)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
