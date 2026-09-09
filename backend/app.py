import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from extensions import db, jwt
from routes.auth import auth_bp
from routes.pedidos import pedidos_bp
from routes.relatorios import relatorios_bp

load_dotenv()


def criar_app(banco_teste=False):
    app = Flask(__name__)

    if banco_teste:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["TESTING"] = True
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pizzaria.db"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 24  # 24 horas (dev)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(pedidos_bp)
    app.register_blueprint(relatorios_bp)

    with app.app_context():
        db.create_all()

    return app


app = criar_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
