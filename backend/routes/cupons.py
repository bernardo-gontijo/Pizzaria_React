from datetime import datetime, time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from auth_utils import admin_required
from cupons_service import (
    calcular_desconto,
    motivo_cupom_invalido,
    normalizar_codigo,
)
from extensions import db
from models import Cupom

cupons_bp = Blueprint("cupons", __name__)


def _parse_data(valor, fim_do_dia=False):
    if valor in (None, ""):
        return None

    if not isinstance(valor, str):
        raise ValueError("Data inválida")

    try:
        if len(valor) == 10:
            data = datetime.fromisoformat(valor).date()

            return datetime.combine(
                data,
                time.max if fim_do_dia else time.min,
            )

        return datetime.fromisoformat(valor)

    except ValueError as erro:
        raise ValueError(
            "Data inválida. Use o formato ISO, por exemplo 2026-09-30"
        ) from erro


def _converter_float(
    valor,
    campo,
    padrao=None,
):
    if valor is None:
        return padrao

    try:
        return float(valor)

    except (TypeError, ValueError) as erro:
        raise ValueError(f"{campo} deve ser um número") from erro


def _converter_int(
    valor,
    campo,
):
    if valor is None:
        return None

    try:
        return int(valor)

    except (TypeError, ValueError) as erro:
        raise ValueError(f"{campo} deve ser um número inteiro") from erro


@cupons_bp.route(
    "/cupons",
    methods=["POST"],
)
@admin_required
def criar_cupom():
    dados = request.get_json(silent=True) or {}

    codigo = normalizar_codigo(dados.get("codigo"))

    if not codigo:
        return (
            jsonify({"erro": ("O código do cupom é obrigatório")}),
            400,
        )

    if Cupom.query.filter_by(codigo=codigo).first():
        return (
            jsonify({"erro": ("Já existe um cupom com este código")}),
            409,
        )

    try:
        valor = _converter_float(
            dados.get("valor"),
            "valor",
        )

        pedido_minimo = _converter_float(
            dados.get("pedidoMinimo"),
            "pedidoMinimo",
            0.0,
        )

        limite_usos_total = _converter_int(
            dados.get("limiteUsosTotal"),
            "limiteUsosTotal",
        )

        limite_usos_por_cliente = _converter_int(
            dados.get("limiteUsosPorCliente"),
            "limiteUsosPorCliente",
        )

        data_inicio = _parse_data(
            dados.get("dataInicio"),
        )

        data_fim = _parse_data(
            dados.get("dataFim"),
            fim_do_dia=True,
        )

    except ValueError as erro:
        return (
            jsonify(
                {
                    "erro": str(erro),
                }
            ),
            400,
        )

    ativo = dados.get(
        "ativo",
        True,
    )

    if not isinstance(
        ativo,
        bool,
    ):
        return (
            jsonify({"erro": ("ativo deve ser true ou false")}),
            400,
        )

    cupom = Cupom(
        codigo=codigo,
        tipo_desconto=dados.get("tipoDesconto"),
        valor=valor,
        data_inicio=data_inicio,
        data_fim=data_fim,
        pedido_minimo=pedido_minimo,
        limite_usos_total=limite_usos_total,
        limite_usos_por_cliente=(limite_usos_por_cliente),
        ativo=ativo,
    )

    db.session.add(cupom)

    try:
        db.session.commit()

    except ValueError as erro:
        db.session.rollback()

        return (
            jsonify(
                {
                    "erro": str(erro),
                }
            ),
            400,
        )

    return (
        jsonify(cupom.to_dict()),
        201,
    )


@cupons_bp.route(
    "/cupons",
    methods=["GET"],
)
@admin_required
def listar_cupons():
    cupons = Cupom.query.order_by(Cupom.criado_em.desc()).all()

    return (
        jsonify([cupom.to_dict() for cupom in cupons]),
        200,
    )


@cupons_bp.route(
    "/cupons/disponiveis",
    methods=["GET"],
)
@jwt_required()
def listar_cupons_disponiveis():
    usuario_id = int(get_jwt_identity())

    try:
        subtotal = _converter_float(
            request.args.get("subtotal"),
            "subtotal",
        )

    except ValueError as erro:
        return (
            jsonify(
                {
                    "erro": str(erro),
                }
            ),
            400,
        )

    if subtotal is None:
        return (
            jsonify({"erro": ("subtotal é obrigatório")}),
            400,
        )

    if subtotal < 0:
        return (
            jsonify({"erro": ("subtotal não pode ser negativo")}),
            400,
        )

    cupons = Cupom.query.filter_by(ativo=True).order_by(Cupom.criado_em.desc()).all()

    disponiveis = []
    quase_disponiveis = []

    for cupom in cupons:
        pedido_minimo = cupom.pedido_minimo or 0

        # Usamos pelo menos o valor mínimo
        # somente para verificar se existe
        # algum outro impedimento:
        #
        # - expirado
        # - futuro
        # - limite total
        # - limite por cliente
        #
        # Depois verificamos o pedido mínimo
        # separadamente.
        subtotal_para_validacao = max(
            subtotal,
            pedido_minimo,
        )

        motivo_sem_minimo = motivo_cupom_invalido(
            cupom,
            usuario_id,
            subtotal_para_validacao,
        )

        if motivo_sem_minimo:
            continue

        if subtotal < pedido_minimo:
            quase_disponiveis.append(
                {
                    "codigo": (cupom.codigo),
                    "tipoDesconto": (cupom.tipo_desconto),
                    "valor": (cupom.valor),
                    "pedidoMinimo": (pedido_minimo),
                    "faltanteParaUsar": round(
                        pedido_minimo - subtotal,
                        2,
                    ),
                }
            )

            continue

        desconto = calcular_desconto(
            cupom,
            subtotal,
        )

        disponiveis.append(
            {
                "codigo": (cupom.codigo),
                "tipoDesconto": (cupom.tipo_desconto),
                "valor": (cupom.valor),
                "pedidoMinimo": (pedido_minimo),
                "descontoCalculado": (desconto),
            }
        )

    # O cliente vê primeiro o cupom
    # que oferece o maior desconto.
    disponiveis.sort(
        key=lambda cupom: cupom["descontoCalculado"],
        reverse=True,
    )

    # Nos cupons ainda bloqueados pelo
    # pedido mínimo, mostramos primeiro
    # o que falta menos para liberar.
    quase_disponiveis.sort(key=lambda cupom: cupom["faltanteParaUsar"])

    return (
        jsonify(
            {
                "subtotal": round(
                    subtotal,
                    2,
                ),
                "disponiveis": (disponiveis),
                "quaseDisponiveis": (quase_disponiveis),
            }
        ),
        200,
    )


@cupons_bp.route(
    "/cupons/<string:codigo>",
    methods=["GET"],
)
@admin_required
def detalhar_cupom(codigo):
    codigo_normalizado = normalizar_codigo(codigo)

    cupom = Cupom.query.filter_by(codigo=codigo_normalizado).first()

    if not cupom:
        return (
            jsonify({"erro": ("Cupom não encontrado")}),
            404,
        )

    return (
        jsonify(cupom.to_dict()),
        200,
    )


@cupons_bp.route(
    "/cupons/validar",
    methods=["POST"],
)
@jwt_required()
def validar_cupom():
    usuario_id = int(get_jwt_identity())

    dados = request.get_json(silent=True) or {}

    codigo = normalizar_codigo(dados.get("codigo"))

    if not codigo:
        return (
            jsonify({"erro": ("O código do cupom é obrigatório")}),
            400,
        )

    try:
        subtotal = _converter_float(
            dados.get("subtotal"),
            "subtotal",
        )

    except ValueError as erro:
        return (
            jsonify(
                {
                    "erro": str(erro),
                }
            ),
            400,
        )

    if subtotal is None:
        return (
            jsonify({"erro": ("subtotal é obrigatório")}),
            400,
        )

    if subtotal < 0:
        return (
            jsonify({"erro": ("subtotal não pode ser negativo")}),
            400,
        )

    cupom = Cupom.query.filter_by(codigo=codigo).first()

    if not cupom:
        return (
            jsonify(
                {
                    "valido": False,
                    "erro": ("Cupom não encontrado"),
                }
            ),
            404,
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
                    "valido": False,
                    "codigo": (cupom.codigo),
                    "erro": motivo,
                }
            ),
            200,
        )

    desconto = calcular_desconto(
        cupom,
        subtotal,
    )

    total_com_desconto = round(
        max(
            subtotal - desconto,
            0,
        ),
        2,
    )

    return (
        jsonify(
            {
                "valido": True,
                "codigo": (cupom.codigo),
                "tipoDesconto": (cupom.tipo_desconto),
                "valor": (cupom.valor),
                "subtotal": round(
                    subtotal,
                    2,
                ),
                "descontoCalculado": (desconto),
                "totalComDesconto": (total_com_desconto),
            }
        ),
        200,
    )
