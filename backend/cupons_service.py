from datetime import datetime

from models import UsoCupom


def normalizar_codigo(codigo):
    if not isinstance(codigo, str):
        return ""

    return codigo.strip().upper()


def motivo_cupom_invalido(
    cupom,
    usuario_id,
    subtotal,
):
    agora = datetime.utcnow()

    if not cupom.ativo:
        return "Cupom inativo"

    if cupom.data_inicio is not None and agora < cupom.data_inicio:
        return "Cupom ainda não está válido"

    if cupom.data_fim is not None and agora > cupom.data_fim:
        return "Cupom expirado"

    if subtotal < cupom.pedido_minimo:
        return f"Pedido mínimo de R$ {cupom.pedido_minimo:.2f} " "não atingido"

    if cupom.limite_usos_total is not None:
        total_usos = UsoCupom.query.filter_by(
            cupom_id=cupom.id,
        ).count()

        if total_usos >= cupom.limite_usos_total:
            return "Limite total de usos do cupom atingido"

    if cupom.limite_usos_por_cliente is not None:
        usos_cliente = UsoCupom.query.filter_by(
            cupom_id=cupom.id,
            usuario_id=usuario_id,
        ).count()

        if usos_cliente >= cupom.limite_usos_por_cliente:
            return "Você já atingiu o limite de usos " "deste cupom"

    return None


def calcular_desconto(cupom, subtotal):
    if cupom.tipo_desconto == "percentual":
        desconto = subtotal * (cupom.valor / 100)
    else:
        desconto = cupom.valor

    desconto = min(
        desconto,
        subtotal,
    )

    return round(desconto, 2)
