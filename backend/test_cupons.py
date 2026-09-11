from datetime import datetime

import pytest
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Cupom, UsoCupom, Usuario


def test_criar_cupom(app):
    with app.app_context():
        cupom = Cupom(
            codigo="PIZZA10",
            tipo_desconto="percentual",
            valor=10,
            data_inicio=datetime(2026, 9, 10),
            data_fim=datetime(2026, 9, 30),
            pedido_minimo=50,
            limite_usos_total=100,
            limite_usos_por_cliente=1,
            ativo=True,
        )

        db.session.add(cupom)
        db.session.commit()

        salvo = Cupom.query.filter_by(codigo="PIZZA10").first()

        assert salvo is not None
        assert salvo.codigo == "PIZZA10"
        assert salvo.tipo_desconto == "percentual"
        assert salvo.valor == 10
        assert salvo.pedido_minimo == 50
        assert salvo.limite_usos_total == 100
        assert salvo.limite_usos_por_cliente == 1
        assert salvo.ativo is True


def test_cupom_to_dict(app):
    with app.app_context():
        cupom = Cupom(
            codigo="DESC20",
            tipo_desconto="fixo",
            valor=20,
            pedido_minimo=80,
        )

        db.session.add(cupom)
        db.session.commit()

        dados = cupom.to_dict()

        assert dados["id"] == cupom.id
        assert dados["codigo"] == "DESC20"
        assert dados["tipoDesconto"] == "fixo"
        assert dados["valor"] == 20
        assert dados["pedidoMinimo"] == 80
        assert dados["ativo"] is True
        assert dados["criadoEm"] is not None
        assert dados["atualizadoEm"] is not None


def test_codigo_do_cupom_deve_ser_unico(app):
    with app.app_context():
        cupom_1 = Cupom(
            codigo="UNICO10",
            tipo_desconto="percentual",
            valor=10,
        )

        cupom_2 = Cupom(
            codigo="UNICO10",
            tipo_desconto="fixo",
            valor=10,
        )

        db.session.add(cupom_1)
        db.session.commit()

        db.session.add(cupom_2)

        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()


def test_cupom_pode_nao_ter_limites_de_uso(app):
    with app.app_context():
        cupom = Cupom(
            codigo="SEMLIMITE",
            tipo_desconto="percentual",
            valor=5,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.limite_usos_total is None
        assert cupom.limite_usos_por_cliente is None


def test_registrar_uso_de_cupom(app):
    with app.app_context():
        usuario = Usuario(
            nome="Kauan",
            email="kauan@teste.com",
            role="cliente",
        )
        usuario.set_senha("123456")

        cupom = Cupom(
            codigo="CLIENTE10",
            tipo_desconto="percentual",
            valor=10,
        )

        db.session.add_all(
            [
                usuario,
                cupom,
            ]
        )
        db.session.commit()

        uso = UsoCupom(
            cupom_id=cupom.id,
            usuario_id=usuario.id,
            desconto_aplicado=8.50,
        )

        db.session.add(uso)
        db.session.commit()

        assert uso.cupom_id == cupom.id
        assert uso.usuario_id == usuario.id
        assert uso.desconto_aplicado == 8.50

        assert len(cupom.usos) == 1
        assert cupom.usos[0].id == uso.id

        assert len(usuario.usos_cupom) == 1
        assert usuario.usos_cupom[0].id == uso.id

        dados = uso.to_dict()

        assert dados["cupomId"] == cupom.id
        assert dados["usuarioId"] == usuario.id
        assert dados["pedidoId"] is None
        assert dados["descontoAplicado"] == 8.50
        assert dados["usadoEm"] is not None


def test_codigo_do_cupom_e_normalizado(app):
    with app.app_context():
        cupom = Cupom(
            codigo="  pizza10  ",
            tipo_desconto="percentual",
            valor=10,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.codigo == "PIZZA10"


def test_codigo_vazio_e_rejeitado(app):
    with app.app_context():
        cupom = Cupom(
            codigo="   ",
            tipo_desconto="percentual",
            valor=10,
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="O código do cupom é obrigatório",
        ):
            db.session.commit()

        db.session.rollback()


def test_tipo_de_desconto_invalido_e_rejeitado(app):
    with app.app_context():
        cupom = Cupom(
            codigo="TIPOINVALIDO",
            tipo_desconto="qualquer",
            valor=10,
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="Tipo de desconto inválido",
        ):
            db.session.commit()

        db.session.rollback()


@pytest.mark.parametrize(
    "tipo_desconto,valor",
    [
        ("percentual", 0),
        ("percentual", -10),
        ("fixo", 0),
        ("fixo", -5),
    ],
)
def test_rejeita_valor_de_desconto_invalido(
    app,
    tipo_desconto,
    valor,
):
    with app.app_context():
        cupom = Cupom(
            codigo="VALORINVALIDO",
            tipo_desconto=tipo_desconto,
            valor=valor,
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="O valor do desconto deve ser maior que zero",
        ):
            db.session.commit()

        db.session.rollback()


def test_rejeita_percentual_acima_de_100(app):
    with app.app_context():
        cupom = Cupom(
            codigo="PERCENTUAL101",
            tipo_desconto="percentual",
            valor=101,
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="O desconto percentual não pode ser maior que 100%",
        ):
            db.session.commit()

        db.session.rollback()


def test_percentual_de_100_e_permitido(app):
    with app.app_context():
        cupom = Cupom(
            codigo="GRATIS100",
            tipo_desconto="percentual",
            valor=100,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.valor == 100


def test_rejeita_pedido_minimo_negativo(app):
    with app.app_context():
        cupom = Cupom(
            codigo="MINIMO",
            tipo_desconto="fixo",
            valor=10,
            pedido_minimo=-1,
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="O pedido mínimo não pode ser negativo",
        ):
            db.session.commit()

        db.session.rollback()


def test_pedido_minimo_zero_e_permitido(app):
    with app.app_context():
        cupom = Cupom(
            codigo="MINIMOZERO",
            tipo_desconto="fixo",
            valor=10,
            pedido_minimo=0,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.pedido_minimo == 0


def test_rejeita_data_final_anterior_a_inicial(app):
    with app.app_context():
        cupom = Cupom(
            codigo="DATAS",
            tipo_desconto="percentual",
            valor=10,
            data_inicio=datetime(2026, 9, 30),
            data_fim=datetime(2026, 9, 10),
        )

        db.session.add(cupom)

        with pytest.raises(
            ValueError,
            match="A data final não pode ser anterior à data inicial",
        ):
            db.session.commit()

        db.session.rollback()


def test_data_final_igual_a_inicial_e_permitida(app):
    with app.app_context():
        data = datetime(2026, 9, 10)

        cupom = Cupom(
            codigo="MESMODIA",
            tipo_desconto="percentual",
            valor=10,
            data_inicio=data,
            data_fim=data,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.data_inicio == data
        assert cupom.data_fim == data


@pytest.mark.parametrize(
    "limite_total,limite_cliente",
    [
        (0, None),
        (-1, None),
        (None, 0),
        (None, -1),
    ],
)
def test_rejeita_limites_de_uso_invalidos(
    app,
    limite_total,
    limite_cliente,
):
    with app.app_context():
        cupom = Cupom(
            codigo="LIMITES",
            tipo_desconto="percentual",
            valor=10,
            limite_usos_total=limite_total,
            limite_usos_por_cliente=limite_cliente,
        )

        db.session.add(cupom)

        with pytest.raises(ValueError):
            db.session.commit()

        db.session.rollback()


def test_limites_de_uso_positivos_sao_permitidos(app):
    with app.app_context():
        cupom = Cupom(
            codigo="LIMITESOK",
            tipo_desconto="percentual",
            valor=10,
            limite_usos_total=100,
            limite_usos_por_cliente=2,
        )

        db.session.add(cupom)
        db.session.commit()

        assert cupom.limite_usos_total == 100
        assert cupom.limite_usos_por_cliente == 2


def test_atualizar_cupom_tambem_executa_validacao(app):
    with app.app_context():
        cupom = Cupom(
            codigo="ATUALIZAR10",
            tipo_desconto="percentual",
            valor=10,
        )

        db.session.add(cupom)
        db.session.commit()

        cupom.valor = -1

        with pytest.raises(
            ValueError,
            match="O valor do desconto deve ser maior que zero",
        ):
            db.session.commit()

        db.session.rollback()
