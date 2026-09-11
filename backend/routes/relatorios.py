from datetime import datetime
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from extensions import db
from models import Pedido, ItemPedido
from auth_utils import admin_required

relatorios_bp = Blueprint("relatorios", __name__)


def _parse_periodo():
    inicio = request.args.get("inicio")
    fim = request.args.get("fim")
    inicio_dt = datetime.fromisoformat(inicio) if inicio else None
    fim_dt = datetime.fromisoformat(fim) if fim else None
    return inicio_dt, fim_dt


@relatorios_bp.route("/relatorios/mais-vendida", methods=["GET"])
@admin_required
def mais_vendida():
    inicio_dt, fim_dt = _parse_periodo()

    query = (
        db.session.query(
            ItemPedido.nome_item, func.sum(ItemPedido.quantidade).label("total_vendido")
        )
        .join(Pedido, Pedido.id == ItemPedido.pedido_id)
        .filter(ItemPedido.tipo_item == "pizza")
    )

    if inicio_dt:
        query = query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        query = query.filter(Pedido.criado_em <= fim_dt)

    resultado = (
        query.group_by(ItemPedido.nome_item)
        .order_by(func.sum(ItemPedido.quantidade).desc())
        .first()
    )

    if not resultado:
        return jsonify({"pizza": None, "quantidade": 0}), 200

    return jsonify({"pizza": resultado[0], "quantidade": int(resultado[1])}), 200


@relatorios_bp.route("/relatorios/faturamento", methods=["GET"])
@admin_required
def faturamento():
    inicio_dt, fim_dt = _parse_periodo()
    agrupar = request.args.get("agrupar", "dia")  # dia, semana, mes

    formatos = {
        "dia": "%Y-%m-%d",
        "semana": "%Y-%W",
        "mes": "%Y-%m",
    }
    formato = formatos.get(agrupar, "%Y-%m-%d")

    query = db.session.query(
        func.strftime(formato, Pedido.criado_em).label("periodo"),
        func.sum(Pedido.total).label("faturamento"),
    )

    if inicio_dt:
        query = query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        query = query.filter(Pedido.criado_em <= fim_dt)

    resultados = query.group_by("periodo").order_by("periodo").all()

    return (
        jsonify([{"periodo": r[0], "faturamento": float(r[1])} for r in resultados]),
        200,
    )
