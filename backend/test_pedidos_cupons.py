from extensions import db
from models import Cupom, Pedido, UsoCupom


def registrar_e_logar(
    client,
    email="cliente-pedido@teste.com",
):
    resposta_registro = client.post(
        "/register",
        json={
            "nome": "Cliente Teste",
            "email": email,
            "senha": "123456",
            "role": "cliente",
        },
    )

    assert resposta_registro.status_code == 201

    resposta_login = client.post(
        "/login",
        json={
            "email": email,
            "senha": "123456",
        },
    )

    assert resposta_login.status_code == 200

    dados = resposta_login.get_json()

    return (
        dados["token"],
        int(dados["usuario"]["id"]),
    )


def headers(token):
    return {
        "Authorization": f"Bearer {token}",
    }


def criar_cupom(
    app,
    codigo="PIZZA10",
    tipo_desconto="percentual",
    valor=10,
    pedido_minimo=0,
    limite_usos_total=None,
    limite_usos_por_cliente=None,
):
    with app.app_context():
        cupom = Cupom(
            codigo=codigo,
            tipo_desconto=tipo_desconto,
            valor=valor,
            pedido_minimo=pedido_minimo,
            limite_usos_total=limite_usos_total,
            limite_usos_por_cliente=limite_usos_por_cliente,
            ativo=True,
        )

        db.session.add(cupom)
        db.session.commit()

        return cupom.id


def payload_pedido(
    preco=80,
    cupom_codigo=None,
    desconto=None,
):
    payload = {
        "tipo": "delivery",
        "cliente": {
            "nome": "Cliente Teste",
            "email": "cliente-pedido@teste.com",
            "telefone": "92999999999",
        },
        "endereco": {
            "rua": "Rua Teste",
            "numero": "100",
        },
        "itens": [
            {
                "tipo": "pizza",
                "pizzaId": "pizza-1",
                "pizzaName": "Calabresa",
                "quantity": 1,
                "price": preco,
                "size": "M",
            }
        ],
        "formaPagamento": "pix",
        "taxaEntrega": 5,
    }

    if cupom_codigo is not None:
        payload["cupomCodigo"] = cupom_codigo

    if desconto is not None:
        payload["desconto"] = desconto

    return payload


def test_pedido_aplica_cupom_percentual(
    client,
    app,
):
    token, usuario_id = registrar_e_logar(
        client,
        email="cliente-percentual-pedido@teste.com",
    )

    cupom_id = criar_cupom(
        app,
        codigo="DESC10",
        valor=10,
    )

    resposta = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=80,
            cupom_codigo=" desc10 ",
        ),
        headers=headers(token),
    )

    assert resposta.status_code == 201

    dados = resposta.get_json()

    assert dados["subtotal"] == 80
    assert dados["taxaEntrega"] == 5
    assert dados["desconto"] == 8
    assert dados["total"] == 77

    with app.app_context():
        uso = UsoCupom.query.filter_by(
            pedido_id=int(dados["id"]),
        ).first()

        assert uso is not None
        assert uso.cupom_id == cupom_id
        assert uso.usuario_id == usuario_id
        assert uso.desconto_aplicado == 8


def test_pedido_ignora_desconto_enviado_pelo_cliente(
    client,
    app,
):
    token, _ = registrar_e_logar(
        client,
        email="cliente-desconto-falso@teste.com",
    )

    resposta = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=80,
            desconto=9999,
        ),
        headers=headers(token),
    )

    assert resposta.status_code == 201

    dados = resposta.get_json()

    assert dados["subtotal"] == 80
    assert dados["desconto"] == 0
    assert dados["total"] == 85

    with app.app_context():
        assert UsoCupom.query.count() == 0


def test_pedido_rejeita_cupom_sem_pedido_minimo(
    client,
    app,
):
    token, _ = registrar_e_logar(
        client,
        email="cliente-minimo-pedido@teste.com",
    )

    criar_cupom(
        app,
        codigo="MINIMO100",
        valor=10,
        pedido_minimo=100,
    )

    resposta = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=50,
            cupom_codigo="MINIMO100",
        ),
        headers=headers(token),
    )

    assert resposta.status_code == 400

    assert "Pedido mínimo" in resposta.get_json()["erro"]

    with app.app_context():
        assert Pedido.query.count() == 0
        assert UsoCupom.query.count() == 0


def test_pedido_respeita_limite_por_cliente(
    client,
    app,
):
    token, _ = registrar_e_logar(
        client,
        email="cliente-limite-pedido@teste.com",
    )

    criar_cupom(
        app,
        codigo="UMA_VEZ",
        valor=10,
        limite_usos_por_cliente=1,
    )

    primeira = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=80,
            cupom_codigo="UMA_VEZ",
        ),
        headers=headers(token),
    )

    segunda = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=80,
            cupom_codigo="UMA_VEZ",
        ),
        headers=headers(token),
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 400

    assert segunda.get_json()["erro"] == "Você já atingiu o limite de usos deste cupom"

    with app.app_context():
        assert UsoCupom.query.count() == 1


def test_pedido_com_cupom_fixo_nao_desconta_mais_que_subtotal(
    client,
    app,
):
    token, _ = registrar_e_logar(
        client,
        email="cliente-fixo-pedido@teste.com",
    )

    criar_cupom(
        app,
        codigo="FIXO50",
        tipo_desconto="fixo",
        valor=50,
    )

    resposta = client.post(
        "/pedidos",
        json=payload_pedido(
            preco=20,
            cupom_codigo="FIXO50",
        ),
        headers=headers(token),
    )

    assert resposta.status_code == 201

    dados = resposta.get_json()

    assert dados["subtotal"] == 20
    assert dados["desconto"] == 20

    # O cupom zera no máximo o subtotal.
    # A taxa de entrega continua existindo.
    assert dados["total"] == 5
