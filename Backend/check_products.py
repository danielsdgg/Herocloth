# check_products.py
from app import create_app, db
from app.models.product import Product

app = create_app()
with app.app_context():
    products = Product.query.all()
    for p in products:
        print(f"ID: {p.id}, Name: {p.name}, Category: {p.category}")