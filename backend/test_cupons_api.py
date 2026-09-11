from datetime import datetime, timedelta

from extensions import db
from models import UsoCupom


def registrar_e_logar(
    client,
    email="cliente@teste.com",
    role="cliente",
):
    resposta_registro = client.post(
        "/register",
        json={
            "nome": "Teste",
            "email": email,
            "senha": "123456",
            "role": role,
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
        dados["usuario"]["id"],
    )


def headers(token):
    return {
        "Authorization": f"Bearer {token}",
    }


def criar_cupom_admin(
    client,
    token_admin,
    **alteracoes,
):
    payload = {
        "codigo": "PIZZA10",
        "tipoDesconto": "percentual",
        "valor": 10,
        "pedidoMinimo": 0,
        "limiteUsosTotal": None,
        "limiteUsosPorCliente": None,
        "ativo": True,
    }

    payload.update(alteracoes)

    return client.post(
        "/cupons",
        json=payload,
        headers=headers(token_admin),
    )


def test_criar_cupom_exige_autenticacao(client):
    resposta = client.post(
        "/cupons",
        json={
            "codigo": "PIZZA10",
            "tipoDesconto": "percentual",
            "valor": 10,
        },
    )

    assert resposta.status_code == 401


def test_cliente_comum_nao_pode_criar_cupom(client):
    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-sem-admin@teste.com",
    )

    resposta = criar_cupom_admin(
        client,
        token_cliente,
    )

    assert resposta.status_code == 403
    assert resposta.get_json()["erro"] == ("acesso restrito a administradores")


def test_admin_cria_cupom(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-cria@teste.com",
        role="admin",
    )

    resposta = criar_cupom_admin(
        client,
        token_admin,
        codigo="  pizza10  ",
        pedidoMinimo=50,
        limiteUsosTotal=100,
        limiteUsosPorCliente=1,
    )

    assert resposta.status_code == 201

    dados = resposta.get_json()

    assert dados["codigo"] == "PIZZA10"
    assert dados["tipoDesconto"] == "percentual"
    assert dados["valor"] == 10
    assert dados["pedidoMinimo"] == 50
    assert dados["limiteUsosTotal"] == 100
    assert dados["limiteUsosPorCliente"] == 1
    assert dados["ativo"] is True


def test_admin_nao_pode_criar_codigo_duplicado(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-duplicado@teste.com",
        role="admin",
    )

    primeira = criar_cupom_admin(
        client,
        token_admin,
        codigo="DUPLICADO",
    )

    segunda = criar_cupom_admin(
        client,
        token_admin,
        codigo="duplicado",
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 409

    assert segunda.get_json()["erro"] == ("Já existe um cupom com este código")


def test_api_rejeita_cupom_invalido(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-invalido@teste.com",
        role="admin",
    )

    resposta = criar_cupom_admin(
        client,
        token_admin,
        codigo="ERRO150",
        valor=150,
    )

    assert resposta.status_code == 400
    assert resposta.get_json()["erro"] == (
        "O desconto percentual não pode ser maior que 100%"
    )


def test_admin_lista_cupons(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-lista@teste.com",
        role="admin",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="CUPOM10",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="CUPOM20",
        valor=20,
    )

    resposta = client.get(
        "/cupons",
        headers=headers(token_admin),
    )

    assert resposta.status_code == 200

    dados = resposta.get_json()

    assert len(dados) == 2

    codigos = {cupom["codigo"] for cupom in dados}

    assert codigos == {
        "CUPOM10",
        "CUPOM20",
    }


def test_admin_consulta_cupom_por_codigo(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-detalhe@teste.com",
        role="admin",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="DETALHE10",
    )

    resposta = client.get(
        "/cupons/detalhe10",
        headers=headers(token_admin),
    )

    assert resposta.status_code == 200
    assert resposta.get_json()["codigo"] == "DETALHE10"


def test_validar_cupom_exige_login(client):
    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "PIZZA10",
            "subtotal": 100,
        },
    )

    assert resposta.status_code == 401


def test_cliente_valida_cupom_percentual(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-percentual@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-percentual@teste.com",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="DESC10",
        valor=10,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "desc10",
            "subtotal": 80,
        },
        headers=headers(token_cliente),
    )

    assert resposta.status_code == 200

    dados = resposta.get_json()

    assert dados["valido"] is True
    assert dados["codigo"] == "DESC10"
    assert dados["subtotal"] == 80
    assert dados["descontoCalculado"] == 8
    assert dados["totalComDesconto"] == 72


def test_cupom_fixo_nao_deixa_total_negativo(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-fixo@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-fixo@teste.com",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="FIXO50",
        tipoDesconto="fixo",
        valor=50,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "FIXO50",
            "subtotal": 20,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["valido"] is True
    assert dados["descontoCalculado"] == 20
    assert dados["totalComDesconto"] == 0


def test_cupom_rejeitado_quando_pedido_minimo_nao_e_atingido(
    client,
):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-minimo@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-minimo@teste.com",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="MINIMO100",
        pedidoMinimo=100,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "MINIMO100",
            "subtotal": 50,
        },
        headers=headers(token_cliente),
    )

    assert resposta.status_code == 200

    dados = resposta.get_json()

    assert dados["valido"] is False
    assert "Pedido mínimo" in dados["erro"]


def test_cupom_inativo_e_rejeitado(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-inativo@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-inativo@teste.com",
    )

    criar_cupom_admin(
        client,
        token_admin,
        codigo="INATIVO",
        ativo=False,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "INATIVO",
            "subtotal": 100,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["valido"] is False
    assert dados["erro"] == "Cupom inativo"


def test_cupom_futuro_e_rejeitado(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-futuro@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-futuro@teste.com",
    )

    futuro = (datetime.utcnow() + timedelta(days=2)).isoformat()

    criar_cupom_admin(
        client,
        token_admin,
        codigo="FUTURO",
        dataInicio=futuro,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "FUTURO",
            "subtotal": 100,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["valido"] is False
    assert dados["erro"] == ("Cupom ainda não está válido")


def test_cupom_expirado_e_rejeitado(client):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-expirado@teste.com",
        role="admin",
    )

    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-expirado@teste.com",
    )

    passado = (datetime.utcnow() - timedelta(days=2)).isoformat()

    criar_cupom_admin(
        client,
        token_admin,
        codigo="EXPIRADO",
        dataFim=passado,
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "EXPIRADO",
            "subtotal": 100,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["valido"] is False
    assert dados["erro"] == "Cupom expirado"


def test_limite_total_de_usos_e_respeitado(
    client,
    app,
):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-total@teste.com",
        role="admin",
    )

    token_cliente, usuario_id = registrar_e_logar(
        client,
        email="cliente-total@teste.com",
    )

    resposta_criacao = criar_cupom_admin(
        client,
        token_admin,
        codigo="TOTAL1",
        limiteUsosTotal=1,
    )

    cupom_id = resposta_criacao.get_json()["id"]

    with app.app_context():
        uso = UsoCupom(
            cupom_id=cupom_id,
            usuario_id=usuario_id,
            desconto_aplicado=10,
        )

        db.session.add(uso)
        db.session.commit()

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "TOTAL1",
            "subtotal": 100,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["valido"] is False
    assert dados["erro"] == ("Limite total de usos do cupom atingido")


def test_limite_por_cliente_e_respeitado(
    client,
    app,
):
    token_admin, _ = registrar_e_logar(
        client,
        email="admin-cliente@teste.com",
        role="admin",
    )

    token_cliente_a, usuario_a_id = registrar_e_logar(
        client,
        email="cliente-a@teste.com",
    )

    token_cliente_b, _ = registrar_e_logar(
        client,
        email="cliente-b@teste.com",
    )

    resposta_criacao = criar_cupom_admin(
        client,
        token_admin,
        codigo="CLIENTE1",
        limiteUsosPorCliente=1,
    )

    cupom_id = resposta_criacao.get_json()["id"]

    with app.app_context():
        uso = UsoCupom(
            cupom_id=cupom_id,
            usuario_id=usuario_a_id,
            desconto_aplicado=10,
        )

        db.session.add(uso)
        db.session.commit()

    resposta_a = client.post(
        "/cupons/validar",
        json={
            "codigo": "CLIENTE1",
            "subtotal": 100,
        },
        headers=headers(token_cliente_a),
    )

    resposta_b = client.post(
        "/cupons/validar",
        json={
            "codigo": "CLIENTE1",
            "subtotal": 100,
        },
        headers=headers(token_cliente_b),
    )

    assert resposta_a.status_code == 200
    assert resposta_a.get_json()["valido"] is False

    assert resposta_b.status_code == 200
    assert resposta_b.get_json()["valido"] is True


def test_cupom_inexistente(client):
    token_cliente, _ = registrar_e_logar(
        client,
        email="cliente-inexistente@teste.com",
    )

    resposta = client.post(
        "/cupons/validar",
        json={
            "codigo": "NAOEXISTE",
            "subtotal": 100,
        },
        headers=headers(token_cliente),
    )

    dados = resposta.get_json()

    assert resposta.status_code == 404
    assert dados["valido"] is False
    assert dados["erro"] == "Cupom não encontrado"
