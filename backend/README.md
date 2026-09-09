Backend Flask — Pizzaria React

Backend real (substitui o localStorage) para pedidos, autenticação e relatórios.

Como rodar (sem Docker)
powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Servidor sobe em http://127.0.0.1:5000.

Configuração

Antes de rodar pela primeira vez, crie um arquivo .env dentro de backend/ (não vai pro Git) com:

SECRET_KEY=qualquer-string-aleatoria
JWT_SECRET_KEY=outra-string-aleatoria

O banco (pizzaria.db, SQLite) é criado automaticamente na primeira execução.

Autenticação

Todas as rotas de pedidos e relatórios exigem um token JWT no header:

Authorization: Bearer <token>

O token é obtido no login e expira em 24h (ambiente de dev).

POST /register
json
{ "nome": "Gabriel", "email": "gabriel@teste.com", "senha": "123456" }
POST /login
json
{ "email": "gabriel@teste.com", "senha": "123456" }

Retorna { "token": "...", "usuario": {...} }.

Pedidos
POST /pedidos (autenticado)
json
{
"tipo": "delivery",
"itens": [
{ "nome_item": "Calabresa", "tipo_item": "pizza", "quantidade": 2, "preco_unitario": 45.90 }
]
}

O usuario_id é pego do token, não do body — ninguém cria pedido em nome de outro.

GET /pedidos (autenticado)

Lista só os pedidos do usuário logado.

GET /pedidos/<id> (autenticado)

Detalhe do pedido + histórico de status.

PATCH /pedidos/<id>/status (autenticado)
json
{ "status": "em_preparo" }

Registra a mudança no histórico automaticamente.

Relatórios
GET /relatorios/mais-vendida?inicio=2026-01-01&fim=2026-12-31

Pizza mais vendida no período (parâmetros inicio/fim são opcionais).

GET /relatorios/faturamento?inicio=...&fim=...&agrupar=dia

Faturamento agrupado por dia, semana ou mes (padrão: dia).

Com Docker (opcional)
powershell
docker compose up --build

Requer virtualização habilitada na BIOS e Docker Desktop instalado.

Status

✅ Auth (JWT) · ✅ Pedidos (CRUD + histórico) · ✅ Relatórios · ⏳ Integração com o front (Kauan/Paulo)
