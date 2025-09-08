# drop_products_table.py
import sqlite3

conn = sqlite3.connect('ecommerce.db')
cursor = conn.cursor()
cursor.execute('DROP TABLE IF EXISTS products')
conn.commit()
conn.close()
print("Dropped products table if it existed")