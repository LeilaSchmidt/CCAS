from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from models import User, CrimeReport

api = Blueprint('api', __name__)
web = Blueprint('web', __name__)

# Define valid categories based on our test data
VALID_CATEGORIES = {
    'Theft',
    'Vandalism',
    'Suspicious Activity',
    'Burglary',
    'Public Disorder',
    'Drug Activity',
    'Noise Disturbance',
    'Fraud',
    'Traffic Violation',
    'Missing Person',
    'Harassment'
}

# Web routes (for pages)
@web.route('/')
@web.route('/home')
@web.route('/index')
def index():
    return render_template('index.html')

@web.route('/report/<report_id>')
def report_detail(report_id):
    # First check if report exists
    report = CrimeReport.objects(id=report_id).first()
    if not report:
        return render_template('404.html'), 404
    return render_template('report_detail.html', report_id=report_id)

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if User.objects(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(email=data['email'])
    user.set_password(data['password'])
    user.save()

    return jsonify({'message': 'User registered successfully'}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.objects(email=data['email']).first()

    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': access_token}), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@api.route('/reports', methods=['POST'])
@jwt_required()
def create_report():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Validate category
    if data['category'] not in VALID_CATEGORIES:
        return jsonify({
            'error': 'Invalid category',
            'valid_categories': list(VALID_CATEGORIES)
        }), 400

    # Validate severity (assuming 1-5 scale from test data)
    if not isinstance(data['severity'], int) or not 1 <= data['severity'] <= 5:
        return jsonify({
            'error': 'Invalid severity. Must be an integer between 1 and 5'
        }), 400

    try:
        report = CrimeReport(
            title=data['title'],
            description=data['description'],
            location={
                'type': 'Point',
                'coordinates': [
                    float(data['location']['coordinates'][0]),  # longitude
                    float(data['location']['coordinates'][1])  # latitude
                ]
            },
            category=data['category'],
            severity=data['severity'],
            reported_by=user_id
        )
        report.save()
    except (ValueError, KeyError) as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400

    return jsonify({'message': 'Report created successfully'}), 201

@api.route('/reports', methods=['GET'])
def get_reports():
    category = request.args.get('category')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    radius = request.args.get('radius', 5)  # Default to 5 km

    # Build query
    query = {}
    if category:
        query['category'] = category

    if lat and lon:
        query['location__near'] = {
            '$geometry': {'type': 'Point', 'coordinates': [float(lon), float(lat)]},
            '$maxDistance': int(radius) * 1000,  # Convert km to meters
        }

    reports = CrimeReport.objects(**query).order_by('-reported_at')

    return jsonify([{
        'id': str(report.id),
        'title': report.title,
        'description': report.description,
        'location': report.location['coordinates'],
        'category': report.category,
        'severity': report.severity,
        'reported_at': report.reported_at.isoformat(),
        'verified': report.verified,
    } for report in reports]), 200

@api.route('/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    report = CrimeReport.objects(id=report_id).first()
    if not report:
        return jsonify({'error': 'Report not found'}), 404

    return jsonify({
        'id': str(report.id),
        'title': report.title,
        'description': report.description,
        'location': report.location['coordinates'],
        'category': report.category,
        'severity': report.severity,
        'reported_at': report.reported_at.isoformat(),
        'verified': report.verified
    })

@api.route('/categories', methods=['GET'])
def get_categories():
    """Endpoint to retrieve all valid categories"""
    return jsonify({
        'categories': list(VALID_CATEGORIES)
    }), 200