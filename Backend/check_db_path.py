# check_db_path.py
import os
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
db_path = os.path.join(basedir, 'ecommerce.db')
print(f"Database path: {db_path}")