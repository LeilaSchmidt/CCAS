from flask import Flask, render_template
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db
from routes import api, web


def create_app():
    app = Flask(__name__,
                template_folder='../frontend/templates',
                static_folder='../frontend/static')

    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    JWTManager(app)
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')  # API routes under /api
    app.register_blueprint(web)  # Web routes at root level

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/statistics')
    def statistics():
        return render_template('statistics.html')

    @app.route('/search')
    def search():
        return render_template('search.html')

    @app.route('/resources')
    def resources():
        return render_template('resources.html')

    return app