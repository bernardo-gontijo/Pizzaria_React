from uuid import uuid4

from flask import Blueprint, jsonify, request

from auth_utils import staff_required
from extensions import db
from models import Mesa

mesas_bp = Blueprint("mesas", __name__)


@mesas_bp.route("/mesas", methods=["GET"])
@staff_required
def listar_mesas():
    mesas = Mesa.query.order_by(Mesa.numero.asc()).all()

    return jsonify([mesa.to_dict() for mesa in mesas]), 200


@mesas_bp.route("/mesas/<string:mesa_id>", methods=["GET"])
@staff_required
def buscar_mesa(mesa_id):
    mesa = Mesa.query.filter_by(id=mesa_id).first()

    if not mesa:
        return jsonify({"erro": "mesa não encontrada"}), 404

    return jsonify(mesa.to_dict()), 200


@mesas_bp.route("/mesas", methods=["POST"])
@staff_required
def criar_mesa():
    dados = request.get_json(silent=True) or {}

    numero = dados.get("numero")

    if numero is None:
        return jsonify({"erro": "número da mesa é obrigatório"}), 400

    try:
        numero = int(numero)
    except (TypeError, ValueError):
        return jsonify({"erro": "número da mesa deve ser um número inteiro"}), 400

    if numero <= 0:
        return jsonify({"erro": "número da mesa deve ser maior que zero"}), 400

    mesa_existente = Mesa.query.filter_by(numero=numero).first()

    if mesa_existente:
        return jsonify({"erro": f"mesa {numero} já existe"}), 409

    mesa = Mesa(
        id=str(uuid4()),
        numero=numero,
        status="livre",
    )

    db.session.add(mesa)
    db.session.commit()

    return jsonify(mesa.to_dict()), 201


@mesas_bp.route("/mesas/<string:mesa_id>", methods=["DELETE"])
@staff_required
def remover_mesa(mesa_id):
    mesa = Mesa.query.filter_by(id=mesa_id).first()

    if not mesa:
        return jsonify({"erro": "mesa não encontrada"}), 404

    comandas_abertas = [
        comanda for comanda in mesa.comandas if comanda.status != "paga"
    ]

    if comandas_abertas:
        return (
            jsonify(
                {"erro": ("não é possível remover uma mesa " "com comandas pendentes")}
            ),
            409,
        )

    db.session.delete(mesa)
    db.session.commit()

    return "", 204
