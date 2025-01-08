from datetime import datetime
from flask_mongoengine import MongoEngine
from werkzeug.security import generate_password_hash, check_password_hash
from mongoengine import StringField, DateTimeField, PointField, IntField, BooleanField, ReferenceField

db = MongoEngine()


class User(db.Document):
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class CrimeReport(db.Document):
    title = StringField(required=True)
    description = StringField(required=True)
    location = PointField(required=True)
    category = StringField(required=True)
    severity = IntField(min_value=1, max_value=5, required=True)
    reported_by = ReferenceField(User)
    reported_at = DateTimeField(default=datetime.utcnow)
    verified = BooleanField(default=False)
    meta = {
        'indexes': [
            {'fields': ['location'], 'index_type': '2dsphere'}
        ]
    }
