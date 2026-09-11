import json
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from auth_utils import admin_required, staff_required, STAFF_ROLES
from cupons_service import (
    calcular_desconto,
    motivo_cupom_invalido,
    normalizar_codigo,
)
from extensions import db
from models import (
    Cupom,
    HistoricoStatus,
    ItemPedido,
    Pedido,
    UsoCupom,
)

pedidos_bp = Blueprint("pedidos", __name__)

STATUS_VALIDOS = (
    "pendente",
    "confirmado",
    "preparando",
    "pronto",
    "saiu_para_entrega",
    "entregue",
    "cancelado",
)

MENSAGENS_STATUS = {
    "pendente": "Pedido recebido",
    "confirmado": "Pedido confirmado",
    "preparando": "Pedido em preparação",
    "pronto": "Pedido pronto para entrega",
    "saiu_para_entrega": "Pedido saiu para entrega",
    "entregue": "Pedido entregue",
    "cancelado": "Pedido cancelado",
}


@pedidos_bp.route("/pedidos", methods=["POST"])
@jwt_required()
def criar_pedido():
    usuario_id = int(get_jwt_identity())
    dados = request.get_json(silent=True) or {}

    tipo = dados.get("tipo")
    itens = dados.get("itens", [])

    if not tipo or not itens:
        return (
            jsonify(
                {
                    "erro": "tipo e itens são obrigatórios",
                }
            ),
            400,
        )

    cliente = dados.get("cliente", {}) or {}
    endereco = dados.get("endereco")

    try:
        subtotal = sum(item["price"] * item["quantity"] for item in itens)

    except (KeyError, TypeError, ValueError) as erro:
        return (
            jsonify({"erro": ("item inválido ou sem campo " f"obrigatório: {erro}")}),
            400,
        )

    subtotal = round(subtotal, 2)

    taxa_entrega = (
        dados.get(
            "taxaEntrega",
            0,
        )
        or 0
    )

    try:
        taxa_entrega = float(taxa_entrega)

    except (TypeError, ValueError):
        return (
            jsonify({"erro": ("taxaEntrega deve ser um número")}),
            400,
        )

    # O frontend envia somente o código.
    # O desconto é calculado exclusivamente
    # pelo backend.
    cupom_codigo = normalizar_codigo(dados.get("cupomCodigo"))

    desconto = 0.0
    cupom = None

    if cupom_codigo:
        cupom = Cupom.query.filter_by(codigo=cupom_codigo).first()

        if not cupom:
            return (
                jsonify(
                    {
                        "erro": "Cupom não encontrado",
                    }
                ),
                400,
            )

        motivo = motivo_cupom_invalido(
            cupom,
            usuario_id,
            subtotal,
        )

        if motivo:
            return (
                jsonify(
                    {
                        "erro": motivo,
                    }
                ),
                400,
            )

        desconto = calcular_desconto(
            cupom,
            subtotal,
        )

    total = round(
        max(
            subtotal + taxa_entrega - desconto,
            0,
        ),
        2,
    )

    pedido = Pedido(
        usuario_id=usuario_id,
        tipo=tipo,
        status="pendente",
        cliente_nome=cliente.get("nome"),
        cliente_email=cliente.get("email"),
        cliente_telefone=cliente.get("telefone"),
        endereco=(json.dumps(endereco) if endereco else None),
        subtotal=subtotal,
        taxa_entrega=taxa_entrega,
        desconto=desconto,
        total=total,
        forma_pagamento=dados.get("formaPagamento"),
        troco_para=dados.get("trocoPara"),
        observacoes=dados.get("observacoes"),
        mesa_id=dados.get("mesaId"),
    )

    db.session.add(pedido)

    # Precisamos do ID do pedido
    # antes de cadastrar itens e uso do cupom.
    db.session.flush()

    try:
        for item in itens:
            db.session.add(
                ItemPedido(
                    pedido_id=pedido.id,
                    pizza_id=item.get("pizzaId"),
                    nome_item=item["pizzaName"],
                    tipo_item=item.get(
                        "tipo",
                        "pizza",
                    ),
                    quantidade=item["quantity"],
                    preco_unitario=item["price"],
                    tamanho=item.get("size"),
                    observacoes=item.get("observations"),
                )
            )

    except KeyError as erro:
        db.session.rollback()

        return (
            jsonify({"erro": ("item sem o campo " f"obrigatório: {erro}")}),
            400,
        )

    db.session.add(
        HistoricoStatus(
            pedido_id=pedido.id,
            status="pendente",
            mensagem=("Pedido recebido com sucesso"),
        )
    )

    # Só registra o uso depois que o pedido
    # foi realmente criado.
    if cupom is not None:
        db.session.add(
            UsoCupom(
                cupom_id=cupom.id,
                usuario_id=usuario_id,
                pedido_id=pedido.id,
                desconto_aplicado=desconto,
            )
        )

    db.session.commit()

    return (
        jsonify(pedido.to_dict()),
        201,
    )


@pedidos_bp.route("/pedidos/<int:pedido_id>/itens", methods=["PATCH"])
@staff_required
def atualizar_itens_pedido(pedido_id):
    pedido = Pedido.query.filter_by(id=pedido_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    dados = request.get_json()
    itens = dados.get("itens")

    if itens is None:
        return jsonify({"erro": "itens é obrigatório"}), 400

    try:
        novo_subtotal = sum(item["price"] * item["quantity"] for item in itens)
    except KeyError as erro:
        return jsonify({"erro": f"item sem o campo obrigatório: {erro}"}), 400

    for item_existente in list(pedido.itens):
        db.session.delete(item_existente)
    db.session.flush()

    try:
        for item in itens:
            db.session.add(
                ItemPedido(
                    pedido_id=pedido.id,
                    pizza_id=item.get("pizzaId"),
                    nome_item=item["pizzaName"],
                    tipo_item=item.get("tipo", "pizza"),
                    quantidade=item["quantity"],
                    preco_unitario=item["price"],
                    tamanho=item.get("size"),
                    observacoes=item.get("observations"),
                )
            )
    except KeyError as erro:
        db.session.rollback()
        return jsonify({"erro": f"item sem o campo obrigatório: {erro}"}), 400

    pedido.subtotal = novo_subtotal
    pedido.total = novo_subtotal + pedido.taxa_entrega - pedido.desconto

    db.session.commit()

    return jsonify(pedido.to_dict()), 200


@pedidos_bp.route("/pedidos", methods=["GET"])
@jwt_required()
def listar_pedidos():
    usuario_id = int(get_jwt_identity())

    pedidos = (
        Pedido.query.filter_by(usuario_id=usuario_id)
        .order_by(Pedido.criado_em.desc())
        .all()
    )

    return (
        jsonify([pedido.to_dict() for pedido in pedidos]),
        200,
    )


@pedidos_bp.route("/pedidos/admin", methods=["GET"])
@staff_required
def listar_todos_pedidos():
    query = Pedido.query

    status = request.args.get("status")

    if status:
        if status not in STATUS_VALIDOS:
            return (
                jsonify(
                    {
                        "erro": (
                            "status inválido. "
                            "Use um de: "
                            f"{', '.join(STATUS_VALIDOS)}"
                        )
                    }
                ),
                400,
            )

        query = query.filter(Pedido.status == status)

    tipo = request.args.get("tipo")
    if tipo:
        query = query.filter(Pedido.tipo == tipo)

    inicio = request.args.get("inicio")

    fim = request.args.get("fim")

    if inicio:
        query = query.filter(Pedido.criado_em >= datetime.fromisoformat(inicio))

    if fim:
        query = query.filter(Pedido.criado_em <= datetime.fromisoformat(fim))

    pedidos = query.order_by(Pedido.criado_em.desc()).all()

    return (
        jsonify([pedido.to_dict() for pedido in pedidos]),
        200,
    )


@pedidos_bp.route(
    "/pedidos/<int:pedido_id>",
    methods=["GET"],
)
@jwt_required()
def detalhar_pedido(pedido_id):
    usuario_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    if role in STAFF_ROLES:
        pedido = Pedido.query.filter_by(id=pedido_id).first()
    else:
        pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return (
            jsonify({"erro": ("pedido não encontrado")}),
            404,
        )

    return (
        jsonify(pedido.to_dict()),
        200,
    )


@pedidos_bp.route(
    "/pedidos/<int:pedido_id>/status",
    methods=["PATCH"],
)
@jwt_required()
def atualizar_status(pedido_id):
    usuario_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    if role in STAFF_ROLES:
        pedido = Pedido.query.filter_by(id=pedido_id).first()
    else:
        pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return (
            jsonify({"erro": ("pedido não encontrado")}),
            404,
        )

    dados = request.get_json(silent=True) or {}

    novo_status = dados.get("status")

    if not novo_status:
        return (
            jsonify({"erro": ("status é obrigatório")}),
            400,
        )

    if novo_status not in STATUS_VALIDOS:
        return (
            jsonify(
                {
                    "erro": (
                        "status inválido. " "Use um de: " f"{', '.join(STATUS_VALIDOS)}"
                    )
                }
            ),
            400,
        )

    mensagem = dados.get("message") or MENSAGENS_STATUS.get(
        novo_status,
        "Status atualizado",
    )

    pedido.status = novo_status

    db.session.add(
        HistoricoStatus(
            pedido_id=pedido.id,
            status=novo_status,
            mensagem=mensagem,
        )
    )

    db.session.commit()

    return (
        jsonify(pedido.to_dict()),
        200,
    )
