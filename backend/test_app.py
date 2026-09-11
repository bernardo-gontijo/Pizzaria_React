def registrar_e_logar(client, email="teste@teste.com", role="cliente"):
    client.post(
        "/register",
        json={"nome": "Teste", "email": email, "senha": "123456", "role": role},
    )
    resposta = client.post("/login", json={"email": email, "senha": "123456"})
    return resposta.get_json()["token"]


def payload_pedido(tipo="delivery", nome_item="Calabresa", quantity=2, price=45.90):
    return {
        "tipo": tipo,
        "cliente": {
            "nome": "Gabriel",
            "email": "gabriel@teste.com",
            "telefone": "92999999999",
        },
        "itens": [
            {
                "tipo": "pizza",
                "pizzaId": "pizza-1",
                "pizzaName": nome_item,
                "quantity": quantity,
                "price": price,
            }
        ],
    }


def test_register(client):
    resposta = client.post(
        "/register",
        json={"nome": "Gabriel", "email": "gabriel@teste.com", "senha": "123456"},
    )
    assert resposta.status_code == 201
    assert resposta.get_json()["email"] == "gabriel@teste.com"
    assert resposta.get_json()["role"] == "cliente"


def test_register_email_duplicado(client):
    client.post(
        "/register",
        json={"nome": "Gabriel", "email": "dup@teste.com", "senha": "123456"},
    )
    resposta = client.post(
        "/register",
        json={"nome": "Outro", "email": "dup@teste.com", "senha": "123456"},
    )
    assert resposta.status_code == 409


def test_login_sucesso(client):
    client.post(
        "/register",
        json={"nome": "Gabriel", "email": "login@teste.com", "senha": "123456"},
    )
    resposta = client.post(
        "/login", json={"email": "login@teste.com", "senha": "123456"}
    )
    assert resposta.status_code == 200
    assert "token" in resposta.get_json()


def test_login_senha_errada(client):
    client.post(
        "/register",
        json={"nome": "Gabriel", "email": "senha@teste.com", "senha": "123456"},
    )
    resposta = client.post(
        "/login", json={"email": "senha@teste.com", "senha": "errada"}
    )
    assert resposta.status_code == 401


def test_criar_pedido_exige_token(client):
    resposta = client.post("/pedidos", json=payload_pedido())
    assert resposta.status_code == 401


def test_criar_e_listar_pedido(client):
    token = registrar_e_logar(client)
    headers = {"Authorization": f"Bearer {token}"}

    resposta_criar = client.post("/pedidos", json=payload_pedido(), headers=headers)
    assert resposta_criar.status_code == 201
    pedido = resposta_criar.get_json()
    assert pedido["total"] == 91.8
    assert pedido["status"] == "pendente"
    assert pedido["cliente"]["nome"] == "Gabriel"
    assert pedido["itens"][0]["pizzaName"] == "Calabresa"
    assert len(pedido["statusHistorico"]) == 1

    resposta_listar = client.get("/pedidos", headers=headers)
    assert resposta_listar.status_code == 200
    assert len(resposta_listar.get_json()) == 1


def test_atualizar_status(client):
    token = registrar_e_logar(client, email="status@teste.com")
    headers = {"Authorization": f"Bearer {token}"}

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(
            tipo="local", nome_item="Marguerita", quantity=1, price=39.90
        ),
        headers=headers,
    ).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "preparando"},
        headers=headers,
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados["status"] == "preparando"
    assert len(dados["statusHistorico"]) == 2
    assert dados["statusHistorico"][-1]["message"] == "Pedido em preparação"


def test_status_invalido_e_rejeitado(client):
    token = registrar_e_logar(client, email="statusinvalido@teste.com")
    headers = {"Authorization": f"Bearer {token}"}

    pedido = client.post("/pedidos", json=payload_pedido(), headers=headers).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "qualquercoisa"},
        headers=headers,
    )
    assert resposta.status_code == 400


def test_usuario_nao_ve_pedido_de_outro(client):
    token_a = registrar_e_logar(client, email="usuarioa@teste.com")
    token_b = registrar_e_logar(client, email="usuariob@teste.com")

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Portuguesa", quantity=1, price=49.90),
        headers={"Authorization": f"Bearer {token_a}"},
    ).get_json()

    resposta = client.get(
        f"/pedidos/{pedido['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resposta.status_code == 404


def test_relatorio_mais_vendida(client):
    token_cliente = registrar_e_logar(client, email="relatorio@teste.com")
    token_admin = registrar_e_logar(client, email="admin@teste.com", role="admin")

    client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Calabresa", quantity=3, price=45.90),
        headers={"Authorization": f"Bearer {token_cliente}"},
    )

    resposta = client.get(
        "/relatorios/mais-vendida", headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados["pizza"] == "Calabresa"
    assert dados["quantidade"] == 3


def test_relatorio_bloqueado_para_cliente_comum(client):
    token_cliente = registrar_e_logar(client, email="clientecomum@teste.com")

    resposta = client.get(
        "/relatorios/faturamento", headers={"Authorization": f"Bearer {token_cliente}"}
    )
    assert resposta.status_code == 403


def test_relatorio_resumo(client):
    token_cliente = registrar_e_logar(client, email="resumocliente@teste.com")
    token_admin = registrar_e_logar(client, email="resumoadmin@teste.com", role="admin")
    headers_cliente = {"Authorization": f"Bearer {token_cliente}"}

    client.post(
        "/pedidos",
        json={
            **payload_pedido(nome_item="Calabresa", quantity=2, price=45.90),
            "formaPagamento": "pix",
        },
        headers=headers_cliente,
    )
    client.post(
        "/pedidos",
        json={
            **payload_pedido(nome_item="Calabresa", quantity=1, price=45.90),
            "formaPagamento": "pix",
        },
        headers=headers_cliente,
    )
    pedido_cancelado = client.post(
        "/pedidos",
        json={
            **payload_pedido(nome_item="Marguerita", quantity=5, price=39.90),
            "formaPagamento": "dinheiro",
        },
        headers=headers_cliente,
    ).get_json()
    client.patch(
        f"/pedidos/{pedido_cancelado['id']}/status",
        json={"status": "cancelado"},
        headers=headers_cliente,
    )

    resposta = client.get(
        "/relatorios/resumo", headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()

    # o pedido cancelado não deve contar em nenhuma métrica
    assert dados["totalPedidos"] == 2
    assert dados["faturamento"] == 91.8 + 45.90
    assert round(dados["ticketMedio"], 2) == round((91.8 + 45.90) / 2, 2)
    assert dados["pizzaMaisVendida"]["pizza"] == "Calabresa"
    assert dados["pizzaMaisVendida"]["quantidade"] == 3
    assert dados["formaPagamentoMaisUsada"] == "pix"


def test_relatorio_resumo_bloqueado_para_staff_nao_admin(client):
    token_cozinha = registrar_e_logar(
        client, email="resumococinha@teste.com", role="cozinha"
    )

    resposta = client.get(
        "/relatorios/resumo", headers={"Authorization": f"Bearer {token_cozinha}"}
    )
    assert resposta.status_code == 403


def test_relatorio_produtos_mais_vendidos(client):
    token_cliente = registrar_e_logar(client, email="produtoscliente@teste.com")
    token_admin = registrar_e_logar(
        client, email="produtosadmin@teste.com", role="admin"
    )

    client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Calabresa", quantity=4, price=45.90),
        headers={"Authorization": f"Bearer {token_cliente}"},
    )
    client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Marguerita", quantity=1, price=39.90),
        headers={"Authorization": f"Bearer {token_cliente}"},
    )

    resposta = client.get(
        "/relatorios/produtos-mais-vendidos",
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados[0]["produto"] == "Calabresa"
    assert dados[0]["quantidade"] == 4


def test_relatorio_formas_pagamento(client):
    token_cliente = registrar_e_logar(client, email="pagamentocliente@teste.com")
    token_admin = registrar_e_logar(
        client, email="pagamentoadmin@teste.com", role="admin"
    )
    headers_cliente = {"Authorization": f"Bearer {token_cliente}"}

    client.post(
        "/pedidos",
        json={**payload_pedido(), "formaPagamento": "cartao_credito"},
        headers=headers_cliente,
    )
    client.post(
        "/pedidos",
        json={**payload_pedido(), "formaPagamento": "pix"},
        headers=headers_cliente,
    )
    client.post(
        "/pedidos",
        json={**payload_pedido(), "formaPagamento": "pix"},
        headers=headers_cliente,
    )

    resposta = client.get(
        "/relatorios/formas-pagamento",
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados[0]["formaPagamento"] == "pix"
    assert dados[0]["quantidade"] == 2


def test_relatorio_faturamento_filtra_por_periodo(client):
    from datetime import datetime, timedelta

    token_cliente = registrar_e_logar(client, email="periodocliente@teste.com")
    token_admin = registrar_e_logar(
        client, email="periodoadmin@teste.com", role="admin"
    )

    client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_cliente}"},
    )

    amanha = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    depois_de_amanha = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")

    resposta = client.get(
        f"/relatorios/resumo?inicio={amanha}&fim={depois_de_amanha}",
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["totalPedidos"] == 0


def test_admin_lista_todos_pedidos(client):
    token_cliente_a = registrar_e_logar(client, email="admina@teste.com")
    token_cliente_b = registrar_e_logar(client, email="adminb@teste.com")
    token_admin = registrar_e_logar(client, email="adminlista@teste.com", role="admin")

    client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Calabresa"),
        headers={"Authorization": f"Bearer {token_cliente_a}"},
    )
    client.post(
        "/pedidos",
        json=payload_pedido(nome_item="Marguerita"),
        headers={"Authorization": f"Bearer {token_cliente_b}"},
    )

    resposta = client.get(
        "/pedidos/admin", headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert resposta.status_code == 200
    assert len(resposta.get_json()) == 2


def test_admin_lista_pedidos_filtra_por_status(client):
    token_cliente = registrar_e_logar(client, email="filtro@teste.com")
    token_admin = registrar_e_logar(client, email="adminfiltro@teste.com", role="admin")

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_cliente}"},
    ).get_json()

    client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "entregue"},
        headers={"Authorization": f"Bearer {token_cliente}"},
    )

    resposta = client.get(
        "/pedidos/admin?status=entregue",
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert resposta.status_code == 200
    assert len(resposta.get_json()) == 1
    assert resposta.get_json()[0]["status"] == "entregue"


def test_admin_lista_pedidos_bloqueada_para_cliente(client):
    token_cliente = registrar_e_logar(client, email="clientebloqueado@teste.com")

    resposta = client.get(
        "/pedidos/admin", headers={"Authorization": f"Bearer {token_cliente}"}
    )
    assert resposta.status_code == 403


def test_seed_cria_usuarios_padrao(client):
    resposta = client.post(
        "/login", json={"email": "admin@pizzashop.com", "senha": "123456"}
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["usuario"]["role"] == "admin"

    resposta = client.post(
        "/login", json={"email": "cozinha@pizzashop.com", "senha": "123456"}
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["usuario"]["role"] == "cozinha"

    resposta = client.post(
        "/login", json={"email": "entregador@pizzashop.com", "senha": "123456"}
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["usuario"]["role"] == "entregador"


def test_staff_atualiza_status_de_pedido_alheio(client):
    token_cliente = registrar_e_logar(client, email="donodopedido@teste.com")
    token_cozinha = registrar_e_logar(
        client, email="cozinhastaff@teste.com", role="cozinha"
    )

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_cliente}"},
    ).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {token_cozinha}"},
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["status"] == "confirmado"


def test_staff_ve_detalhe_de_pedido_alheio(client):
    token_cliente = registrar_e_logar(client, email="outrodono@teste.com")
    token_entregador = registrar_e_logar(
        client, email="entregadorstaff@teste.com", role="entregador"
    )

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_cliente}"},
    ).get_json()

    resposta = client.get(
        f"/pedidos/{pedido['id']}",
        headers={"Authorization": f"Bearer {token_entregador}"},
    )
    assert resposta.status_code == 200


def test_cliente_comum_ainda_nao_ve_pedido_de_outro_cliente(client):
    token_a = registrar_e_logar(client, email="clientex@teste.com")
    token_b = registrar_e_logar(client, email="clientey@teste.com")

    pedido = client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_a}"},
    ).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resposta.status_code == 404


def test_cozinha_e_entregador_acessam_pedidos_admin(client):
    token_cliente = registrar_e_logar(client, email="clientepedido@teste.com")
    token_cozinha = registrar_e_logar(
        client, email="cozinhalista@teste.com", role="cozinha"
    )
    token_entregador = registrar_e_logar(
        client, email="entregadorlista@teste.com", role="entregador"
    )

    client.post(
        "/pedidos",
        json=payload_pedido(),
        headers={"Authorization": f"Bearer {token_cliente}"},
    )

    resposta_cozinha = client.get(
        "/pedidos/admin", headers={"Authorization": f"Bearer {token_cozinha}"}
    )
    assert resposta_cozinha.status_code == 200

    resposta_entregador = client.get(
        "/pedidos/admin", headers={"Authorization": f"Bearer {token_entregador}"}
    )
    assert resposta_entregador.status_code == 200


def test_seed_cria_usuario_garcom(client):
    resposta = client.post(
        "/login", json={"email": "garcom@pizzashop.com", "senha": "123456"}
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["usuario"]["role"] == "garcom"


def test_criar_pedido_vazio_para_mesa(client):
    token = registrar_e_logar(client, email="garcomteste@teste.com", role="garcom")
    headers = {"Authorization": f"Bearer {token}"}

    resposta = client.post(
        "/pedidos",
        json={
            "tipo": "local",
            "cliente": {"nome": "Mesa 5"},
            "itens": [],
            "mesaId": "mesa-5",
        },
        headers=headers,
    )
    assert resposta.status_code == 201
    pedido = resposta.get_json()
    assert pedido["itens"] == []
    assert pedido["total"] == 0
    assert pedido["mesaId"] == "mesa-5"


def test_atualizar_itens_de_pedido(client):
    token = registrar_e_logar(client, email="garcomitens@teste.com", role="garcom")
    headers = {"Authorization": f"Bearer {token}"}

    pedido = client.post(
        "/pedidos",
        json={
            "tipo": "local",
            "cliente": {"nome": "Mesa 3"},
            "itens": [],
            "mesaId": "mesa-3",
        },
        headers=headers,
    ).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/itens",
        json={
            "itens": [
                {
                    "tipo": "pizza",
                    "pizzaId": "pizza-1",
                    "pizzaName": "Calabresa",
                    "quantity": 2,
                    "price": 45.90,
                }
            ]
        },
        headers=headers,
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert len(dados["itens"]) == 1
    assert dados["total"] == 91.8


def test_atualizar_itens_bloqueado_para_cliente_comum(client):
    token_cliente = registrar_e_logar(client, email="clientesemacesso@teste.com")
    headers = {"Authorization": f"Bearer {token_cliente}"}

    pedido = client.post("/pedidos", json=payload_pedido(), headers=headers).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/itens",
        json={"itens": []},
        headers=headers,
    )
    assert resposta.status_code == 403