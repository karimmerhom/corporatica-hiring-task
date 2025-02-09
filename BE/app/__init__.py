from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from app.routes import tabular, text, images
    app.register_blueprint(tabular.bp)
    app.register_blueprint(images.bp)
    app.register_blueprint(text.text_bp)

    return app
