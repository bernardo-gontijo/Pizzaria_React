import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.String(20), nullable=False, default="cliente"
    )  # "cliente" ou "admin"

    pedidos = db.relationship("Pedido", backref="usuario", lazy=True)

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def checar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "role": self.role,
        }


class Pedido(db.Model):
    __tablename__ = "pedido"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # "local" ou "delivery"
    status = db.Column(db.String(30), nullable=False, default="pendente")

    # Dados do cliente informados no checkout (podem diferir do perfil do usuário)
    cliente_nome = db.Column(db.String(120), nullable=True)
    cliente_email = db.Column(db.String(120), nullable=True)
    cliente_telefone = db.Column(db.String(30), nullable=True)

    # Endereço de entrega, guardado como JSON (estrutura livre, definida pelo front)
    endereco = db.Column(db.Text, nullable=True)

    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    taxa_entrega = db.Column(db.Float, nullable=False, default=0.0)
    desconto = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)

    forma_pagamento = db.Column(db.String(30), nullable=True)
    troco_para = db.Column(db.Float, nullable=True)
    observacoes = db.Column(db.Text, nullable=True)

    # Presentes apenas em pedidos feitos por um garçom, vinculados a uma mesa
    mesa_id = db.Column(db.String(50), nullable=True)
    gorjeta = db.Column(db.Float, nullable=True)

    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    itens = db.relationship(
        "ItemPedido", backref="pedido", lazy=True, cascade="all, delete-orphan"
    )
    historico = db.relationship(
        "HistoricoStatus", backref="pedido", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "cliente": {
                "nome": self.cliente_nome,
                "email": self.cliente_email,
                "telefone": self.cliente_telefone,
            },
            "endereco": json.loads(self.endereco) if self.endereco else None,
            "itens": [item.to_dict() for item in self.itens],
            "subtotal": self.subtotal,
            "taxaEntrega": self.taxa_entrega,
            "desconto": self.desconto,
            "total": self.total,
            "formaPagamento": self.forma_pagamento,
            "trocoPara": self.troco_para,
            "status": self.status,
            "statusHistorico": [h.to_dict() for h in self.historico],
            "observacoes": self.observacoes,
            "createdAt": self.criado_em.isoformat(),
            "updatedAt": self.atualizado_em.isoformat(),
            "mesaId": self.mesa_id,
            "gorjeta": self.gorjeta,
            "usuario_id": self.usuario_id,
            "tipo": self.tipo,
        }


class ItemPedido(db.Model):
    __tablename__ = "item_pedido"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedido.id"), nullable=False)

    pizza_id = db.Column(db.String(50), nullable=True)  # id do item no cardápio
    nome_item = db.Column(db.String(120), nullable=False)
    tipo_item = db.Column(db.String(20), nullable=False)  # "pizza", "bebida", "combo"
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    preco_unitario = db.Column(db.Float, nullable=False)
    tamanho = db.Column(db.String(5), nullable=True)  # "P", "M", "G", "GG"
    observacoes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "tipo": self.tipo_item,
            "pizzaId": self.pizza_id,
            "pizzaName": self.nome_item,
            "quantity": self.quantidade,
            "price": self.preco_unitario,
            "size": self.tamanho,
            "observations": self.observacoes,
        }


class HistoricoStatus(db.Model):
    __tablename__ = "historico_status"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedido.id"), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    mensagem = db.Column(db.Text, nullable=True)
    mudou_em = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "status": self.status,
            "timestamp": self.mudou_em.isoformat(),
            "message": self.mensagem,
        }
