from datetime import datetime, timedelta
import random
from math import cos, pi, sqrt, sin
from flask import current_app
from models import CrimeReport


def generate_random_location(center_lat, center_lon, radius_km, min_radius_km=0):
    """
    Generate a random location within a given radius range of a center point.
    Uses a uniform distribution to avoid clustering near the center.

    Args:
        center_lat (float): Center latitude
        center_lon (float): Center longitude
        radius_km (float): Maximum radius in kilometers
        min_radius_km (float): Minimum radius in kilometers (default 0)
    """
    # Earth's radius in kilometers
    EARTH_RADIUS = 6371.0

    # Convert radius from kilometers to degrees
    # Calculate approximate degrees for the given distance
    max_radius_deg = (radius_km / EARTH_RADIUS) * (180.0 / pi)
    min_radius_deg = (min_radius_km / EARTH_RADIUS) * (180.0 / pi)

    # Adjust longitude radius based on latitude to account for earth's shape
    longitude_radius = max_radius_deg / cos(center_lat * pi / 180.0)

    # Generate random angle and radius (using square root for uniform distribution)
    angle = random.uniform(0, 2 * pi)

    # Generate radius between min and max (using square root for uniform distribution)
    radius_range = max_radius_deg - min_radius_deg
    radius_at_point = min_radius_deg + (radius_range * sqrt(random.uniform(0, 1)))

    # Calculate new point
    new_lat = center_lat + (radius_at_point * cos(angle))
    new_lon = center_lon + (radius_at_point * sin(angle))

    return [new_lon, new_lat]  # Return in [longitude, latitude] format for MongoDB


def create_test_reports(center_lat=51.338, center_lon=7.410, radius_km=15, min_radius_km=0, num_reports=10):
    """
    Create test reports within a specified radius range of a center point.
    Default coordinates set to your map's current center.

    Args:
        center_lat (float): Center latitude
        center_lon (float): Center longitude
        radius_km (float): Maximum radius in kilometers
        min_radius_km (float): Minimum radius in kilometers for generating reports
        num_reports (int): Number of reports to generate
    """
    try:
        # Categories and their possible severity ranges
        categories = {
            'Theft': (2, 4),
            'Vandalism': (1, 3),
            'Suspicious Activity': (1, 3),
            'Burglary': (3, 5),
            'Public Disorder': (1, 3),
            'Drug Activity': (3, 5),
            'Noise Disturbance': (1, 2),
            'Fraud': (2, 4),
            'Traffic Violation': (2, 4),
            'Missing Person': (4, 5),
            'Harassment': (2, 4)
        }

        # Sample descriptions for each category
        descriptions = {
            'Theft': [
                "Bicycle stolen from outside local shop",
                "Shoplifting incident at retail store",
                "Vehicle break-in reported in parking lot"
            ],
            'Vandalism': [
                "Graffiti found on public property",
                "Property damage reported at local business",
                "Windows broken at community center"
            ],
            'Suspicious Activity': [
                "Suspicious person loitering in the area",
                "Unusual behavior reported by residents",
                "Strange vehicle repeatedly circling neighborhood"
            ],
            'Burglary': [
                "Break-in at residential property",
                "Business burglarized after hours",
                "Attempted forced entry reported"
            ],
            'Public Disorder': [
                "Group causing disturbance in public area",
                "Drunk and disorderly conduct reported",
                "Public altercation between individuals"
            ],
            'Drug Activity': [
                "Suspected drug dealing observed in area",
                "Drug paraphernalia found in public space",
                "Unusual activity suggesting drug sales"
            ],
            'Noise Disturbance': [
                "Loud party reported by neighbors",
                "Excessive noise from construction site",
                "Vehicle causing noise disturbance"
            ],
            'Fraud': [
                "Credit card fraud reported at local business",
                "Scam targeting elderly residents",
                "Identity theft incident reported"
            ],
            'Traffic Violation': [
                "Dangerous driving observed on main road",
                "Vehicle speeding in residential area",
                "Illegal parking blocking emergency access"
            ],
            'Missing Person': [
                "Elderly person reported missing from care home",
                "Child reported missing from local area",
                "Vulnerable adult missing from residence"
            ],
            'Harassment': [
                "Individual reporting repeated harassment",
                "Threatening behavior towards residents",
                "Online harassment case reported"
            ]
        }

        # Generate reports
        for _ in range(num_reports):
            # Generate random location within radius range
            location_coords = generate_random_location(center_lat, center_lon, radius_km, min_radius_km)

            # Select random category and appropriate severity
            category = random.choice(list(categories.keys()))
            min_severity, max_severity = categories[category]
            severity = random.randint(min_severity, max_severity)

            # Generate random time within last 24 hours
            hours_ago = random.uniform(0, 24)
            report_time = datetime.now() - timedelta(hours=hours_ago)

            # Create description
            description = random.choice(descriptions[category])

            report_data = {
                "title": f"{category} Incident",
                "description": description,
                "location": {
                    "type": "Point",
                    "coordinates": location_coords
                },
                "category": category,
                "severity": severity,
                "verified": random.choice([True, False]),
                "reported_at": report_time
            }

            report = CrimeReport(**report_data)
            report.save()
            print(f"Created report: {report.title} at {location_coords}")

        print(f"Successfully created {num_reports} test reports between {min_radius_km}km and {radius_km}km radius!")

    except Exception as e:
        print(f"Error creating reports: {str(e)}")


if __name__ == "__main__":
    # For testing directly, create a test Flask app
    from app import create_app

    app = create_app()
    with app.app_context():
        create_test_reports(num_reports=20)