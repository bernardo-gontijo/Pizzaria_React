def registrar_e_logar(client, email, role):
    client.post(
        "/register",
        json={
            "nome": "Teste Comanda",
            "email": email,
            "senha": "123456",
            "role": role,
        },
    )

    resposta = client.post(
        "/login",
        json={
            "email": email,
            "senha": "123456",
        },
    )

    return resposta.get_json()["token"]


def headers_com_token(token):
    return {
        "Authorization": f"Bearer {token}",
    }


def criar_mesa(client, headers, numero):
    resposta = client.post(
        "/mesas",
        json={"numero": numero},
        headers=headers,
    )

    assert resposta.status_code == 201

    return resposta.get_json()


def criar_pedido_local(client, headers, mesa_id, nome="Calabresa"):
    resposta = client.post(
        "/pedidos",
        json={
            "tipo": "local",
            "cliente": {
                "nome": "Cliente da mesa",
            },
            "itens": [
                {
                    "tipo": "pizza",
                    "pizzaId": "pizza-1",
                    "pizzaName": nome,
                    "quantity": 1,
                    "price": 45.90,
                }
            ],
            "mesaId": mesa_id,
            "taxaEntrega": 0,
        },
        headers=headers,
    )

    assert resposta.status_code == 201

    return resposta.get_json()


def test_criar_varias_comandas_na_mesma_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda1@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        30,
    )

    primeira = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    )

    segunda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Maria"},
        headers=headers,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 201

    comanda_1 = primeira.get_json()
    comanda_2 = segunda.get_json()

    assert comanda_1["id"] != comanda_2["id"]

    assert comanda_1["mesaId"] == mesa["id"]
    assert comanda_2["mesaId"] == mesa["id"]

    assert comanda_1["nome"] == "João"
    assert comanda_2["nome"] == "Maria"

    assert comanda_1["status"] == "aberta"


def test_nao_duplica_comanda_principal_ao_abrir_mesa_duas_vezes(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda2@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        31,
    )

    primeira = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={},
        headers=headers,
    )

    segunda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={},
        headers=headers,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 200

    comanda_1 = primeira.get_json()
    comanda_2 = segunda.get_json()

    assert comanda_1["id"] == comanda_2["id"]

    resposta_lista = client.get(
        f"/mesas/{mesa['id']}/comandas",
        headers=headers,
    )

    comandas = resposta_lista.get_json()

    comandas_principal_abertas = [
        c
        for c in comandas
        if c["status"] == "aberta" and (c["nome"] or "Comanda principal") == "Comanda principal"
    ]

    assert len(comandas_principal_abertas) == 1


def test_permite_nova_comanda_principal_apos_a_anterior_ser_paga(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda3@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        32,
    )

    primeira = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={},
        headers=headers,
    )

    comanda_1 = primeira.get_json()

    client.patch(
        f"/comandas/{comanda_1['id']}/pagar",
        headers=headers,
    )

    segunda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={},
        headers=headers,
    )

    assert segunda.status_code == 201

    comanda_2 = segunda.get_json()

    assert comanda_2["id"] != comanda_1["id"]
    assert comanda_2["status"] == "aberta"
    assert comanda_2["status"] == "aberta"


def test_criar_comanda_deixa_mesa_ocupada(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda2@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        31,
    )

    client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Cliente 1"},
        headers=headers,
    )

    resposta = client.get(
        f"/mesas/{mesa['id']}",
        headers=headers,
    )

    assert resposta.status_code == 200

    mesa_atualizada = resposta.get_json()

    assert mesa_atualizada["status"] == "ocupada"
    assert len(mesa_atualizada["comandas"]) == 1


def test_listar_varias_comandas_da_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda3@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        32,
    )

    client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    )

    client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Maria"},
        headers=headers,
    )

    client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Pedro"},
        headers=headers,
    )

    resposta = client.get(
        f"/mesas/{mesa['id']}/comandas",
        headers=headers,
    )

    assert resposta.status_code == 200

    comandas = resposta.get_json()

    assert len(comandas) == 3

    nomes = [comanda["nome"] for comanda in comandas]

    assert nomes == [
        "João",
        "Maria",
        "Pedro",
    ]


def test_cliente_comum_nao_pode_criar_comanda(client):
    token_garcom = registrar_e_logar(
        client,
        "garcom.comanda4@teste.com",
        "garcom",
    )

    headers_garcom = headers_com_token(token_garcom)

    mesa = criar_mesa(
        client,
        headers_garcom,
        33,
    )

    token_cliente = registrar_e_logar(
        client,
        "cliente.comanda@teste.com",
        "cliente",
    )

    resposta = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Cliente"},
        headers=headers_com_token(token_cliente),
    )

    assert resposta.status_code == 403


def test_nao_cria_comanda_em_mesa_inexistente(client):
    token = registrar_e_logar(
        client,
        "garcom.comanda5@teste.com",
        "garcom",
    )

    resposta = client.post(
        "/mesas/mesa-inexistente/comandas",
        json={"nome": "João"},
        headers=headers_com_token(token),
    )

    assert resposta.status_code == 404


def test_pagar_uma_comanda_nao_libera_mesa_se_existir_outra_aberta(client):
    token = registrar_e_logar(
        client,
        "garcom.pagamento1@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        40,
    )

    primeira = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    ).get_json()

    client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Maria"},
        headers=headers,
    )

    resposta = client.patch(
        f"/comandas/{primeira['id']}/pagar",
        headers=headers,
    )

    assert resposta.status_code == 200

    dados = resposta.get_json()

    assert dados["comanda"]["status"] == "paga"
    assert dados["mesa"]["status"] == "ocupada"


def test_pagar_todas_comandas_libera_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.pagamento2@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        41,
    )

    primeira = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    ).get_json()

    segunda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Maria"},
        headers=headers,
    ).get_json()

    primeira_paga = client.patch(
        f"/comandas/{primeira['id']}/pagar",
        headers=headers,
    )

    assert primeira_paga.status_code == 200
    assert primeira_paga.get_json()["mesa"]["status"] == "ocupada"

    segunda_paga = client.patch(
        f"/comandas/{segunda['id']}/pagar",
        headers=headers,
    )

    assert segunda_paga.status_code == 200

    dados = segunda_paga.get_json()

    assert dados["comanda"]["status"] == "paga"
    assert dados["mesa"]["status"] == "livre"

    mesa_final = client.get(
        f"/mesas/{mesa['id']}",
        headers=headers,
    ).get_json()

    assert mesa_final["status"] == "livre"


def test_vincular_pedido_a_comanda_da_mesma_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.vinculo1@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        50,
    )

    comanda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    ).get_json()

    pedido = criar_pedido_local(
        client,
        headers,
        mesa["id"],
    )

    resposta = client.post(
        f"/comandas/{comanda['id']}/pedidos/{pedido['id']}",
        headers=headers,
    )

    assert resposta.status_code == 201

    comanda_atualizada = resposta.get_json()

    assert len(comanda_atualizada["pedidos"]) == 1
    assert comanda_atualizada["pedidos"][0]["id"] == pedido["id"]


def test_nao_vincula_pedido_de_outra_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.vinculo2@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa_1 = criar_mesa(
        client,
        headers,
        51,
    )

    mesa_2 = criar_mesa(
        client,
        headers,
        52,
    )

    comanda = client.post(
        f"/mesas/{mesa_1['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    ).get_json()

    pedido = criar_pedido_local(
        client,
        headers,
        mesa_2["id"],
    )

    resposta = client.post(
        f"/comandas/{comanda['id']}/pedidos/{pedido['id']}",
        headers=headers,
    )

    assert resposta.status_code == 409


def test_mesmo_pedido_nao_pode_entrar_em_duas_comandas(client):
    token = registrar_e_logar(
        client,
        "garcom.vinculo3@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        53,
    )

    comanda_1 = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "João"},
        headers=headers,
    ).get_json()

    comanda_2 = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Maria"},
        headers=headers,
    ).get_json()

    pedido = criar_pedido_local(
        client,
        headers,
        mesa["id"],
    )

    primeira = client.post(
        f"/comandas/{comanda_1['id']}/pedidos/{pedido['id']}",
        headers=headers,
    )

    segunda = client.post(
        f"/comandas/{comanda_2['id']}/pedidos/{pedido['id']}",
        headers=headers,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 409


def test_pedido_vinculado_aparece_ao_listar_comanda(client):
    token = registrar_e_logar(
        client,
        "garcom.vinculo4@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    mesa = criar_mesa(
        client,
        headers,
        54,
    )

    comanda = client.post(
        f"/mesas/{mesa['id']}/comandas",
        json={"nome": "Pedro"},
        headers=headers,
    ).get_json()

    pedido = criar_pedido_local(
        client,
        headers,
        mesa["id"],
        nome="Portuguesa",
    )

    client.post(
        f"/comandas/{comanda['id']}/pedidos/{pedido['id']}",
        headers=headers,
    )

    resposta = client.get(
        f"/mesas/{mesa['id']}/comandas",
        headers=headers,
    )

    assert resposta.status_code == 200

    comandas = resposta.get_json()

    assert len(comandas) == 1
    assert len(comandas[0]["pedidos"]) == 1

    assert comandas[0]["pedidos"][0]["id"] == pedido["id"]

    assert comandas[0]["pedidos"][0]["itens"][0]["pizzaName"] == "Portuguesa"