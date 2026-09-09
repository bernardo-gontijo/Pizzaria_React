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
