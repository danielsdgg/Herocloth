# drop_alembic_version.py
import sqlite3

conn = sqlite3.connect('ecommerce.db')
cursor = conn.cursor()
cursor.execute('DROP TABLE IF EXISTS alembic_version')
conn.commit()
conn.close()
print("Dropped alembic_version table if it existed")