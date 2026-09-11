from flask import Blueprint, jsonify, request

from auth_utils import staff_required
from extensions import db
from models import Comanda, ComandaPedido, Mesa, Pedido

comandas_bp = Blueprint("comandas", __name__)


@comandas_bp.route(
    "/mesas/<string:mesa_id>/comandas",
    methods=["GET"],
)
@staff_required
def listar_comandas_da_mesa(mesa_id):
    mesa = Mesa.query.filter_by(id=mesa_id).first()

    if not mesa:
        return jsonify({"erro": "mesa não encontrada"}), 404

    comandas = (
        Comanda.query.filter_by(mesa_id=mesa_id).order_by(Comanda.criada_em.asc()).all()
    )

    return jsonify([comanda.to_dict() for comanda in comandas]), 200


@comandas_bp.route(
    "/mesas/<string:mesa_id>/comandas",
    methods=["POST"],
)
@staff_required
def criar_comanda(mesa_id):
    mesa = Mesa.query.filter_by(id=mesa_id).first()

    if not mesa:
        return jsonify({"erro": "mesa não encontrada"}), 404

    dados = request.get_json(silent=True) or {}

    nome = dados.get("nome")

    if nome is not None:
        nome = str(nome).strip()

        if not nome:
            nome = None

    comanda = Comanda(
        mesa_id=mesa.id,
        nome=nome,
        status="aberta",
    )

    mesa.status = "ocupada"

    db.session.add(comanda)
    db.session.commit()

    return jsonify(comanda.to_dict()), 201


@comandas_bp.route(
    "/comandas/<int:comanda_id>/pedidos/<int:pedido_id>",
    methods=["POST"],
)
@staff_required
def vincular_pedido_comanda(comanda_id, pedido_id):
    comanda = Comanda.query.filter_by(id=comanda_id).first()

    if not comanda:
        return jsonify({"erro": "comanda não encontrada"}), 404

    if comanda.status == "paga":
        return (
            jsonify(
                {"erro": ("não é possível adicionar pedidos " "a uma comanda paga")}
            ),
            409,
        )

    pedido = Pedido.query.filter_by(id=pedido_id).first()

    if not pedido:
        return jsonify({"erro": "pedido não encontrado"}), 404

    if pedido.tipo != "local":
        return (
            jsonify(
                {"erro": ("apenas pedidos locais podem " "ser vinculados a comandas")}
            ),
            400,
        )

    if pedido.mesa_id != comanda.mesa_id:
        return (
            jsonify({"erro": ("o pedido pertence a outra mesa")}),
            409,
        )

    vinculo_existente = ComandaPedido.query.filter_by(pedido_id=pedido.id).first()

    if vinculo_existente:
        if vinculo_existente.comanda_id == comanda.id:
            return jsonify(comanda.to_dict()), 200

        return (
            jsonify({"erro": ("pedido já está vinculado " "a outra comanda")}),
            409,
        )

    vinculo = ComandaPedido(
        comanda_id=comanda.id,
        pedido_id=pedido.id,
    )

    db.session.add(vinculo)
    db.session.commit()

    return jsonify(comanda.to_dict()), 201


@comandas_bp.route(
    "/comandas/<int:comanda_id>/pagar",
    methods=["PATCH"],
)
@staff_required
def pagar_comanda(comanda_id):
    comanda = Comanda.query.filter_by(id=comanda_id).first()

    if not comanda:
        return jsonify({"erro": "comanda não encontrada"}), 404

    if comanda.status == "paga":
        return jsonify(comanda.to_dict()), 200

    comanda.status = "paga"

    mesa = Mesa.query.filter_by(id=comanda.mesa_id).first()

    if not mesa:
        return jsonify({"erro": "mesa não encontrada"}), 404

    db.session.flush()

    existe_comanda_pendente = (
        Comanda.query.filter(
            Comanda.mesa_id == mesa.id,
            Comanda.status != "paga",
        ).first()
        is not None
    )

    if existe_comanda_pendente:
        mesa.status = "ocupada"
    else:
        mesa.status = "livre"

    db.session.commit()

    return (
        jsonify(
            {
                "comanda": comanda.to_dict(),
                "mesa": mesa.to_dict(),
            }
        ),
        200,
    )
