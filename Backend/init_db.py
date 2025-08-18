from app import create_app, db
from app.models.user import User
from app.models.product import Product

app = create_app()

with app.app_context():
    # Drop and recreate tables
    db.drop_all()
    db.create_all()

    # Add a sample user
    user = User(username="testuser", email="test@example.com", role="user")
    user.set_password("password123")
    db.session.add(user)

    # Add sample products
    products = [
        Product(
            name="Sample Product 1",
            description="A sample product description",
            price=19.99,
            stock=100,
            image1="https://via.placeholder.com/300x300"
        ),
        Product(
            name="Sample Product 2",
            description="Another sample product",
            price=29.99,
            stock=50,
            image1="https://via.placeholder.com/300x300"
        ),
    ]
    db.session.add_all(products)
    db.session.commit()
    print("Database initialized with sample data.")