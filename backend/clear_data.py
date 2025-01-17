from app import create_app
from models import CrimeReport

app = create_app()
with app.app_context():
    CrimeReport.objects.delete()
    print("All reports deleted successfully!")