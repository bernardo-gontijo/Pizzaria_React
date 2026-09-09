import pytest
from app import criar_app
from extensions import db


@pytest.fixture
def app():
    app = criar_app(banco_teste=True)
    with app.app_context():
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
