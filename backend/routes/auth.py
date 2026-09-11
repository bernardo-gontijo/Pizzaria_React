from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db
from models import Usuario

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    dados = request.get_json()
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    role = dados.get("role", "cliente")

    if not nome or not email or not senha:
        return jsonify({"erro": "nome, email e senha são obrigatórios"}), 400

    if role not in ("cliente", "admin", "cozinha", "entregador"):
        return jsonify({"erro": "role deve ser 'cliente' ou 'admin'"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"erro": "email já cadastrado"}), 409

    usuario = Usuario(nome=nome, email=email, role=role)
    usuario.set_senha(senha)
    db.session.add(usuario)
    db.session.commit()

    return jsonify(usuario.to_dict()), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("senha")

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.checar_senha(senha):
        return jsonify({"erro": "email ou senha inválidos"}), 401

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"role": usuario.role},
    )
    return jsonify({"token": token, "usuario": usuario.to_dict()}), 200
