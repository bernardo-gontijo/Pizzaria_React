from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from extensions import db
from models import Avaliacao, Pedido

avaliacoes_bp = Blueprint("avaliacoes", __name__)


@avaliacoes_bp.route("/avaliacoes", methods=["POST"])
@jwt_required()
def criar_avaliacao():
    usuario_id = int(get_jwt_identity())
    dados = request.get_json(silent=True) or {}

    pedido_id = dados.get("pedidoId")
    pizza_id = dados.get("pizzaId")
    nota = dados.get("nota")
    comentario = dados.get("comentario")

    if not pedido_id or not pizza_id:
        return jsonify({"erro": "pedidoId e pizzaId são obrigatórios"}), 400

    if not isinstance(nota, int) or nota < 1 or nota > 5:
        return jsonify({"erro": "nota deve ser um número inteiro de 1 a 5"}), 400

    pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    if pedido.status != "entregue":
        return (
            jsonify({"erro": "só é possível avaliar pedidos já entregues"}),
            400,
        )

    item_do_pedido = next(
        (item for item in pedido.itens if item.pizza_id == pizza_id),
        None,
    )

    if not item_do_pedido:
        return (
            jsonify({"erro": "essa pizza não faz parte deste pedido"}),
            400,
        )

    avaliacao = Avaliacao(
        pedido_id=pedido.id,
        usuario_id=usuario_id,
        pizza_id=pizza_id,
        pizza_nome=item_do_pedido.nome_item,
        nota=nota,
        comentario=comentario,
    )

    db.session.add(avaliacao)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return (
            jsonify({"erro": "você já avaliou esta pizza neste pedido"}),
            409,
        )

    return jsonify(avaliacao.to_dict()), 201


@avaliacoes_bp.route("/avaliacoes/pizza/<string:pizza_id>", methods=["GET"])
def listar_avaliacoes_da_pizza(pizza_id):
    avaliacoes = (
        Avaliacao.query.filter_by(pizza_id=pizza_id)
        .order_by(Avaliacao.criado_em.desc())
        .all()
    )

    media = (
        db.session.query(func.avg(Avaliacao.nota))
        .filter(Avaliacao.pizza_id == pizza_id)
        .scalar()
    )

    return (
        jsonify(
            {
                "pizzaId": pizza_id,
                "media": round(media, 2) if media is not None else None,
                "total": len(avaliacoes),
                "avaliacoes": [
                    avaliacao.to_dict(incluir_cliente=True) for avaliacao in avaliacoes
                ],
            }
        ),
        200,
    )


@avaliacoes_bp.route("/avaliacoes/pedido/<int:pedido_id>", methods=["GET"])
@jwt_required()
def listar_avaliacoes_do_pedido(pedido_id):
    usuario_id = int(get_jwt_identity())

    pedido = Pedido.query.filter_by(id=pedido_id, usuario_id=usuario_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    avaliacoes = Avaliacao.query.filter_by(pedido_id=pedido_id).all()

    return jsonify([avaliacao.to_dict() for avaliacao in avaliacoes]), 200
