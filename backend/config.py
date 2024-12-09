from datetime import timedelta

class Config:
    SECRET_KEY = 'your-secret-key-here'  # Change this in production
    MONGODB_SETTINGS = {
        'db': 'ccas_db',
        'host': 'localhost',
        'port': 27017
    }
    JWT_SECRET_KEY = 'jwt-secret-key'  # Change this in production
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)