# update_product.py
from app import create_app, db
from app.models.product import Product

app = create_app()
with app.app_context():
    product = db.session.get(Product, 1)  # Updated to Session.get()
    if product:
        product.category = "bottoms"
        db.session.commit()
        print(f"Updated product {product.name} with category 'bottoms'")
    else:
        print("Product not found")