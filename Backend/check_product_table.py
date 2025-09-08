# check_product_table.py
import sqlite3
import os

# Use the same path as in app/__init__.py
basedir = os.path.abspath(os.path.dirname(__file__))  # Backend directory
db_path = os.path.join(basedir, 'app', 'ecommerce.db')  # Point to Backend/app/ecommerce.db
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(product)")
columns = cursor.fetchall()
print("Columns in product table:", [col[1] for col in columns])
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables in database:", [table[0] for table in tables])
conn.close()