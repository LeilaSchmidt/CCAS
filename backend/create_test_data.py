from datetime import datetime
from app import create_app
from models import CrimeReport

def create_additional_test_reports():
    app = create_app()
    with app.app_context():
        try:
            # Additional test reports data
            additional_test_reports = [
                {
                    "title": "Break-in at Local Business",
                    "description": "Front window of a convenience store was broken and cash register was emptied. Security cameras were damaged.",
                    "location": {"type": "Point", "coordinates": [8.5311, 52.0282]},
                    "category": "Burglary",
                    "severity": 5,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 8, 23, 15)
                },
                {
                    "title": "Public Intoxication",
                    "description": "Individual causing disturbance outside restaurant, appears heavily intoxicated and is harassing passersby.",
                    "location": {"type": "Point", "coordinates": [8.5299, 52.0305]},
                    "category": "Public Disorder",
                    "severity": 2,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 9, 1, 30)
                },
                {
                    "title": "Vehicle Break-in",
                    "description": "Car window smashed in residential parking lot. GPS and personal items stolen from vehicle.",
                    "location": {"type": "Point", "coordinates": [8.5258, 52.0277]},
                    "category": "Theft",
                    "severity": 3,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 9, 7, 45)
                },
                {
                    "title": "Drug Activity",
                    "description": "Suspected drug dealing observed in alley behind main street. Multiple individuals seen making brief exchanges.",
                    "location": {"type": "Point", "coordinates": [8.5284, 52.0298]},
                    "category": "Drug Activity",
                    "severity": 4,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 9, 10, 20)
                },
                {
                    "title": "Noise Complaint",
                    "description": "Loud party at residential address continuing past midnight. Multiple complaints from neighbors.",
                    "location": {"type": "Point", "coordinates": [8.5267, 52.0315]},
                    "category": "Noise Disturbance",
                    "severity": 1,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 9, 0, 45)
                },
                {
                    "title": "Identity Theft",
                    "description": "Victim reports unauthorized use of credit cards and bank accounts. Multiple fraudulent transactions detected.",
                    "location": {"type": "Point", "coordinates": [8.5301, 52.0289]},
                    "category": "Fraud",
                    "severity": 4,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 9, 11, 30)
                },
                {
                    "title": "Street Racing",
                    "description": "Multiple vehicles engaged in dangerous street racing on main road. Loud exhausts and excessive speeds reported.",
                    "location": {"type": "Point", "coordinates": [8.5329, 52.0276]},
                    "category": "Traffic Violation",
                    "severity": 4,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 9, 13, 15)
                },
                {
                    "title": "Missing Person",
                    "description": "Elderly individual with dementia reported missing from care facility. Last seen wearing blue jacket and grey pants.",
                    "location": {"type": "Point", "coordinates": [8.5292, 52.0308]},
                    "category": "Missing Person",
                    "severity": 5,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 9, 14, 00)
                },
                {
                    "title": "Shoplifting",
                    "description": "Two teenagers caught attempting to steal electronics from department store. Security footage available.",
                    "location": {"type": "Point", "coordinates": [8.5275, 52.0295]},
                    "category": "Theft",
                    "severity": 2,
                    "verified": True,
                    "reported_at": datetime(2025, 1, 9, 15, 30)
                },
                {
                    "title": "Cyber Harassment",
                    "description": "Victim receiving threatening messages and personal information being shared online without consent.",
                    "location": {"type": "Point", "coordinates": [8.5288, 52.0283]},
                    "category": "Harassment",
                    "severity": 3,
                    "verified": False,
                    "reported_at": datetime(2025, 1, 9, 16, 45)
                }
            ]

            # Create reports in database
            for report_data in additional_test_reports:
                report = CrimeReport(**report_data)
                report.save()
                print(f"Created report: {report.title}")

            print("All additional test reports created successfully!")

        except Exception as e:
            print(f"Error creating reports: {str(e)}")

if __name__ == "__main__":
    create_additional_test_reports()