from datetime import datetime
from app import create_app
from models import CrimeReport


def create_test_reports():
    app = create_app()
    with app.app_context():
        try:
            # Clear existing reports
            CrimeReport.objects.delete()

            # Test reports data
            test_reports = [
                {
                    "title": "Bicycle Theft",
                    "description": "A bicycle was stolen from the front of the supermarket. The bicycle was locked but the lock was cut.",
                    "location": {"type": "Point", "coordinates": [8.5241, 52.0292]},
                    "category": "Theft",
                    "severity": 2,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 7, 14, 30)
                },
                {
                    "title": "Vandalism at Park",
                    "description": "Multiple benches and trash bins were damaged in the city park. Graffiti was also found on several surfaces.",
                    "location": {"type": "Point", "coordinates": [8.5341, 52.0312]},
                    "category": "Vandalism",
                    "severity": 3,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 8, 9, 15)
                },
                {
                    "title": "Suspicious Activity",
                    "description": "Group of individuals acting suspiciously around parked cars. Looking into windows and testing door handles.",
                    "location": {"type": "Point", "coordinates": [8.5271, 52.0252]},
                    "category": "Suspicious Activity",
                    "severity": 4,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 8, 16, 45)
                }
            ]

            # Create reports in database
            for report_data in test_reports:
                report = CrimeReport(**report_data)
                report.save()
                print(f"Created report: {report.title}")

            print("All test reports created successfully!")

        except Exception as e:
            print(f"Error creating reports: {str(e)}")


if __name__ == "__main__":
    create_test_reports()