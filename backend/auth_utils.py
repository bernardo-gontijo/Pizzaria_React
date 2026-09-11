from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt

STAFF_ROLES = ("admin", "cozinha", "entregador", "garcom")


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"erro": "acesso restrito a administradores"}), 403
        return fn(*args, **kwargs)

    return wrapper


def staff_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") not in STAFF_ROLES:
            return jsonify({"erro": "acesso restrito à equipe da pizzaria"}), 403
        return fn(*args, **kwargs)

    return wrapper
