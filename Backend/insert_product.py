# insert_product.py
from app import create_app, db
from app.models.product import Product

app = create_app()
with app.app_context():
    product = db.session.get(Product, 1)
    if not product:
        product = Product(
            id=1,
            name="Men's fashion jeans",
            description="An updated mens jeans product",
            price=40.0,
            stock=50,
            image1="https://res.cloudinary.com/ddei3mzex/image/upload/v1709420120/Tomorrow_we_fibght___Instagram_snrhkp.jpg",
            image2="https://res.cloudinary.com/ddei3mzex/image/upload/v1709418342/CEO_arkrdk.jpg",
            image3="https://res.cloudinary.com/ddei3mzex/image/upload/v1694210974/fash_qqif6b.jpg",
            category="bottoms"
        )
        db.session.add(product)
        db.session.commit()
        print("Inserted Men's fashion jeans")
    else:
        print("Product already exists")