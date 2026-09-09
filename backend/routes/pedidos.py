import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Pedido, ItemPedido, HistoricoStatus

pedidos_bp = Blueprint("pedidos", __name__)

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
    usuario_id = get_jwt_identity()
    dados = request.get_json()

    tipo = dados.get("tipo")
    itens = dados.get("itens", [])

    if not tipo or not itens:
        return jsonify({"erro": "tipo e itens são obrigatórios"}), 400

    cliente = dados.get("cliente", {}) or {}
    endereco = dados.get("endereco")

    subtotal = sum(item["price"] * item["quantity"] for item in itens)
    taxa_entrega = dados.get("taxaEntrega", 0) or 0
    desconto = dados.get("desconto", 0) or 0
    total = subtotal + taxa_entrega - desconto

    pedido = Pedido(
        usuario_id=usuario_id,
        tipo=tipo,
        status="pendente",
        cliente_nome=cliente.get("nome"),
        cliente_email=cliente.get("email"),
        cliente_telefone=cliente.get("telefone"),
        endereco=json.dumps(endereco) if endereco else None,
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
    db.session.flush()  # gera o pedido.id antes de criar os itens

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

    db.session.add(
        HistoricoStatus(
            pedido_id=pedido.id,
            status="pendente",
            mensagem="Pedido recebido com sucesso",
        )
    )
    db.session.commit()

    return jsonify(pedido.to_dict()), 201


@pedidos_bp.route("/pedidos", methods=["GET"])
@jwt_required()
def listar_pedidos():
    usuario_id = get_jwt_identity()
    pedidos = (
        Pedido.query.filter_by(usuario_id=usuario_id)
        .order_by(Pedido.criado_em.desc())
        .all()
    )
    return jsonify([p.to_dict() for p in pedidos]), 200


@pedidos_bp.route("/pedidos/<int:pedido_id>", methods=["GET"])
@jwt_required()
def detalhar_pedido(pedido_id):
    usuario_id = get_jwt_identity()
    pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    return jsonify(pedido.to_dict()), 200


@pedidos_bp.route("/pedidos/<int:pedido_id>/status", methods=["PATCH"])
@jwt_required()
def atualizar_status(pedido_id):
    usuario_id = get_jwt_identity()
    pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    dados = request.get_json()
    novo_status = dados.get("status")
    if not novo_status:
        return jsonify({"erro": "status é obrigatório"}), 400

    mensagem = dados.get("message") or MENSAGENS_STATUS.get(
        novo_status, "Status atualizado"
    )

    pedido.status = novo_status
    db.session.add(
        HistoricoStatus(pedido_id=pedido.id, status=novo_status, mensagem=mensagem)
    )
    db.session.commit()

    return jsonify(pedido.to_dict()), 200
