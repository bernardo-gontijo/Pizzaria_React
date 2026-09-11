from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from extensions import db
from models import Pedido, ItemPedido
from auth_utils import admin_required

relatorios_bp = Blueprint("relatorios", __name__)

# Pedidos cancelados não entram em nenhuma métrica financeira ou de
# vendas (faturamento, ticket médio, produtos mais vendidos, forma de
# pagamento mais usada, contagem de pedidos "válidos").
STATUS_EXCLUIDO_DAS_METRICAS = "cancelado"


def _parse_data(valor, fim_do_dia=False):
    """Aceita tanto 'YYYY-MM-DD' quanto um datetime ISO completo.
    Quando é só data e representa o fim do período, empurra para o
    último instante daquele dia (23:59:59.999999) para incluir o dia
    inteiro."""
    if not valor:
        return None

    if len(valor) == 10:  # "YYYY-MM-DD"
        data = datetime.fromisoformat(valor)
        if fim_do_dia:
            data = data + timedelta(days=1) - timedelta(microseconds=1)
        return data

    return datetime.fromisoformat(valor)


def _parse_periodo():
    inicio_dt = _parse_data(request.args.get("inicio"))
    fim_dt = _parse_data(request.args.get("fim"), fim_do_dia=True)
    return inicio_dt, fim_dt


def _query_pedidos_validos(inicio_dt, fim_dt):
    query = Pedido.query.filter(Pedido.status != STATUS_EXCLUIDO_DAS_METRICAS)

    if inicio_dt:
        query = query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        query = query.filter(Pedido.criado_em <= fim_dt)

    return query


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
        .filter(Pedido.status != STATUS_EXCLUIDO_DAS_METRICAS)
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


@relatorios_bp.route("/relatorios/produtos-mais-vendidos", methods=["GET"])
@admin_required
def produtos_mais_vendidos():
    """Ranking de produtos (pizzas, bebidas, combos) por quantidade
    vendida no período — usado no gráfico de produtos mais vendidos."""
    inicio_dt, fim_dt = _parse_periodo()
    limite = request.args.get("limite", 5, type=int)

    query = (
        db.session.query(
            ItemPedido.nome_item,
            func.sum(ItemPedido.quantidade).label("quantidade"),
            func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label(
                "faturamento"
            ),
        )
        .join(Pedido, Pedido.id == ItemPedido.pedido_id)
        .filter(Pedido.status != STATUS_EXCLUIDO_DAS_METRICAS)
    )

    if inicio_dt:
        query = query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        query = query.filter(Pedido.criado_em <= fim_dt)

    resultados = (
        query.group_by(ItemPedido.nome_item)
        .order_by(func.sum(ItemPedido.quantidade).desc())
        .limit(limite)
        .all()
    )

    return (
        jsonify(
            [
                {
                    "produto": r[0],
                    "quantidade": int(r[1]),
                    "faturamento": float(r[2]),
                }
                for r in resultados
            ]
        ),
        200,
    )


@relatorios_bp.route("/relatorios/formas-pagamento", methods=["GET"])
@admin_required
def formas_pagamento():
    """Quantidade e faturamento por forma de pagamento no período —
    usado no gráfico de pizza de formas de pagamento."""
    inicio_dt, fim_dt = _parse_periodo()

    query = _query_pedidos_validos(inicio_dt, fim_dt)
    ids_validos = [p.id for p in query.with_entities(Pedido.id)]

    if not ids_validos:
        return jsonify([]), 200

    resultados = (
        db.session.query(
            Pedido.forma_pagamento,
            func.count(Pedido.id).label("quantidade"),
            func.sum(Pedido.total).label("faturamento"),
        )
        .filter(Pedido.id.in_(ids_validos))
        .group_by(Pedido.forma_pagamento)
        .order_by(func.count(Pedido.id).desc())
        .all()
    )

    return (
        jsonify(
            [
                {
                    "formaPagamento": r[0] or "não informado",
                    "quantidade": int(r[1]),
                    "faturamento": float(r[2] or 0),
                }
                for r in resultados
            ]
        ),
        200,
    )


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
    ).filter(Pedido.status != STATUS_EXCLUIDO_DAS_METRICAS)

    if inicio_dt:
        query = query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        query = query.filter(Pedido.criado_em <= fim_dt)

    resultados = query.group_by("periodo").order_by("periodo").all()

    return (
        jsonify([{"periodo": r[0], "faturamento": float(r[1])} for r in resultados]),
        200,
    )


@relatorios_bp.route("/relatorios/resumo", methods=["GET"])
@admin_required
def resumo():
    """Consolida as métricas de vendas de um período em uma única
    chamada: faturamento total, ticket médio, quantidade de pedidos,
    pizza mais vendida e forma de pagamento mais usada."""
    inicio_dt, fim_dt = _parse_periodo()

    pedidos_validos = _query_pedidos_validos(inicio_dt, fim_dt)
    total_pedidos = pedidos_validos.count()
    ids_validos = [p.id for p in pedidos_validos.with_entities(Pedido.id)]

    faturamento_total = 0.0
    forma_pagamento_query = None

    if ids_validos:
        faturamento_total = (
            db.session.query(func.sum(Pedido.total))
            .filter(Pedido.id.in_(ids_validos))
            .scalar()
            or 0.0
        )

        forma_pagamento_query = (
            db.session.query(
                Pedido.forma_pagamento, func.count(Pedido.id).label("quantidade")
            )
            .filter(Pedido.id.in_(ids_validos))
            .group_by(Pedido.forma_pagamento)
            .order_by(func.count(Pedido.id).desc())
            .first()
        )

    ticket_medio = (faturamento_total / total_pedidos) if total_pedidos else 0.0

    pizza_query = (
        db.session.query(
            ItemPedido.nome_item, func.sum(ItemPedido.quantidade).label("quantidade")
        )
        .join(Pedido, Pedido.id == ItemPedido.pedido_id)
        .filter(ItemPedido.tipo_item == "pizza")
        .filter(Pedido.status != STATUS_EXCLUIDO_DAS_METRICAS)
    )
    if inicio_dt:
        pizza_query = pizza_query.filter(Pedido.criado_em >= inicio_dt)
    if fim_dt:
        pizza_query = pizza_query.filter(Pedido.criado_em <= fim_dt)

    pizza_top = (
        pizza_query.group_by(ItemPedido.nome_item)
        .order_by(func.sum(ItemPedido.quantidade).desc())
        .first()
    )

    return (
        jsonify(
            {
                "faturamento": float(faturamento_total),
                "ticketMedio": float(ticket_medio),
                "totalPedidos": int(total_pedidos),
                "pizzaMaisVendida": (
                    {"pizza": pizza_top[0], "quantidade": int(pizza_top[1])}
                    if pizza_top
                    else None
                ),
                "formaPagamentoMaisUsada": (
                    forma_pagamento_query[0] if forma_pagamento_query else None
                ),
            }
        ),
        200,
    )