from os import environ
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = environ.get('SECRET_KEY')
    JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False