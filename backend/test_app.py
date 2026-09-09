def registrar_e_logar(client, email="teste@teste.com"):
    client.post("/register", json={"nome": "Teste", "email": email, "senha": "123456"})
    resposta = client.post("/login", json={"email": email, "senha": "123456"})
    return resposta.get_json()["token"]


def test_register(client):
    resposta = client.post(
        "/register",
        json={"nome": "Gabriel", "email": "gabriel@teste.com", "senha": "123456"},
    )
    assert resposta.status_code == 201
    assert resposta.get_json()["email"] == "gabriel@teste.com"


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
    resposta = client.post(
        "/pedidos",
        json={"tipo": "delivery", "itens": []},
    )
    assert resposta.status_code == 401


def test_criar_e_listar_pedido(client):
    token = registrar_e_logar(client)
    headers = {"Authorization": f"Bearer {token}"}

    resposta_criar = client.post(
        "/pedidos",
        json={
            "tipo": "delivery",
            "itens": [
                {
                    "nome_item": "Calabresa",
                    "tipo_item": "pizza",
                    "quantidade": 2,
                    "preco_unitario": 45.90,
                }
            ],
        },
        headers=headers,
    )
    assert resposta_criar.status_code == 201
    pedido = resposta_criar.get_json()
    assert pedido["total"] == 91.8
    assert pedido["status"] == "aguardando"

    resposta_listar = client.get("/pedidos", headers=headers)
    assert resposta_listar.status_code == 200
    assert len(resposta_listar.get_json()) == 1


def test_atualizar_status(client):
    token = registrar_e_logar(client, email="status@teste.com")
    headers = {"Authorization": f"Bearer {token}"}

    pedido = client.post(
        "/pedidos",
        json={
            "tipo": "local",
            "itens": [
                {
                    "nome_item": "Marguerita",
                    "tipo_item": "pizza",
                    "quantidade": 1,
                    "preco_unitario": 39.90,
                }
            ],
        },
        headers=headers,
    ).get_json()

    resposta = client.patch(
        f"/pedidos/{pedido['id']}/status",
        json={"status": "em_preparo"},
        headers=headers,
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["status"] == "em_preparo"
    assert len(resposta.get_json()["historico"]) == 2


def test_usuario_nao_ve_pedido_de_outro(client):
    token_a = registrar_e_logar(client, email="usuarioa@teste.com")
    token_b = registrar_e_logar(client, email="usuariob@teste.com")

    pedido = client.post(
        "/pedidos",
        json={
            "tipo": "delivery",
            "itens": [
                {
                    "nome_item": "Portuguesa",
                    "tipo_item": "pizza",
                    "quantidade": 1,
                    "preco_unitario": 49.90,
                }
            ],
        },
        headers={"Authorization": f"Bearer {token_a}"},
    ).get_json()

    resposta = client.get(
        f"/pedidos/{pedido['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resposta.status_code == 404


def test_relatorio_mais_vendida(client):
    token = registrar_e_logar(client, email="relatorio@teste.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/pedidos",
        json={
            "tipo": "delivery",
            "itens": [
                {
                    "nome_item": "Calabresa",
                    "tipo_item": "pizza",
                    "quantidade": 3,
                    "preco_unitario": 45.90,
                }
            ],
        },
        headers=headers,
    )

    resposta = client.get("/relatorios/mais-vendida", headers=headers)
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados["pizza"] == "Calabresa"
    assert dados["quantidade"] == 3
