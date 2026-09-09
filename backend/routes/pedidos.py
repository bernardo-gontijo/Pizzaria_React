from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Pedido, ItemPedido, HistoricoStatus

pedidos_bp = Blueprint("pedidos", __name__)


@pedidos_bp.route("/pedidos", methods=["POST"])
@jwt_required()
def criar_pedido():
    usuario_id = get_jwt_identity()
    dados = request.get_json()

    tipo = dados.get("tipo")
    itens = dados.get("itens", [])

    if not tipo or not itens:
        return jsonify({"erro": "tipo e itens são obrigatórios"}), 400

    total = sum(item["preco_unitario"] * item["quantidade"] for item in itens)

    pedido = Pedido(usuario_id=usuario_id, tipo=tipo, status="pendente", total=total)
    db.session.add(pedido)
    db.session.flush()  # gera o pedido.id antes de criar os itens

    for item in itens:
        db.session.add(
            ItemPedido(
                pedido_id=pedido.id,
                nome_item=item["nome_item"],
                tipo_item=item["tipo_item"],
                quantidade=item["quantidade"],
                preco_unitario=item["preco_unitario"],
            )
        )

        db.session.add(HistoricoStatus(pedido_id=pedido.id, status="pendente"))
    db.session.commit()

    return jsonify(pedido.to_dict(incluir_historico=True)), 201


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

    return jsonify(pedido.to_dict(incluir_historico=True)), 200


@pedidos_bp.route("/pedidos/<int:pedido_id>/status", methods=["PATCH"])
@jwt_required()
def atualizar_status(pedido_id):
    usuario_id = get_jwt_identity()
    pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    novo_status = request.get_json().get("status")
    if not novo_status:
        return jsonify({"erro": "status é obrigatório"}), 400

    pedido.status = novo_status
    db.session.add(HistoricoStatus(pedido_id=pedido.id, status=novo_status))
    db.session.commit()

    return jsonify(pedido.to_dict(incluir_historico=True)), 200
