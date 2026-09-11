def registrar_e_logar(client, email, role):
    client.post(
        "/register",
        json={
            "nome": "Teste Mesa",
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


def test_garcom_cria_mesa(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa1@teste.com",
        "garcom",
    )

    resposta = client.post(
        "/mesas",
        json={"numero": 5},
        headers=headers_com_token(token),
    )

    assert resposta.status_code == 201

    dados = resposta.get_json()

    assert dados["numero"] == 5
    assert dados["status"] == "livre"
    assert dados["id"]
    assert dados["comandas"] == []


def test_cliente_comum_nao_pode_criar_mesa(client):
    token = registrar_e_logar(
        client,
        "cliente.mesa@teste.com",
        "cliente",
    )

    resposta = client.post(
        "/mesas",
        json={"numero": 1},
        headers=headers_com_token(token),
    )

    assert resposta.status_code == 403


def test_nao_permite_mesa_duplicada(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa2@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    primeira = client.post(
        "/mesas",
        json={"numero": 10},
        headers=headers,
    )

    segunda = client.post(
        "/mesas",
        json={"numero": 10},
        headers=headers,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 409


def test_numero_mesa_deve_ser_valido(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa3@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    resposta_zero = client.post(
        "/mesas",
        json={"numero": 0},
        headers=headers,
    )

    resposta_texto = client.post(
        "/mesas",
        json={"numero": "abc"},
        headers=headers,
    )

    assert resposta_zero.status_code == 400
    assert resposta_texto.status_code == 400


def test_lista_mesas_ordenadas_por_numero(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa4@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    client.post(
        "/mesas",
        json={"numero": 20},
        headers=headers,
    )

    client.post(
        "/mesas",
        json={"numero": 3},
        headers=headers,
    )

    client.post(
        "/mesas",
        json={"numero": 11},
        headers=headers,
    )

    resposta = client.get(
        "/mesas",
        headers=headers,
    )

    assert resposta.status_code == 200

    mesas = resposta.get_json()

    numeros = [mesa["numero"] for mesa in mesas]

    assert numeros == [3, 11, 20]


def test_busca_mesa_por_id(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa5@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    criada = client.post(
        "/mesas",
        json={"numero": 8},
        headers=headers,
    ).get_json()

    resposta = client.get(
        f"/mesas/{criada['id']}",
        headers=headers,
    )

    assert resposta.status_code == 200

    mesa = resposta.get_json()

    assert mesa["id"] == criada["id"]
    assert mesa["numero"] == 8
    assert mesa["status"] == "livre"


def test_busca_mesa_inexistente(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa6@teste.com",
        "garcom",
    )

    resposta = client.get(
        "/mesas/mesa-que-nao-existe",
        headers=headers_com_token(token),
    )

    assert resposta.status_code == 404


def test_remove_mesa_livre(client):
    token = registrar_e_logar(
        client,
        "garcom.mesa7@teste.com",
        "garcom",
    )

    headers = headers_com_token(token)

    criada = client.post(
        "/mesas",
        json={"numero": 15},
        headers=headers,
    ).get_json()

    resposta = client.delete(
        f"/mesas/{criada['id']}",
        headers=headers,
    )

    assert resposta.status_code == 204

    busca = client.get(
        f"/mesas/{criada['id']}",
        headers=headers,
    )

    assert busca.status_code == 404
