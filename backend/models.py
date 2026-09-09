from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)

    pedidos = db.relationship("Pedido", backref="usuario", lazy=True)

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def checar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "email": self.email}


class Pedido(db.Model):
    __tablename__ = "pedido"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # "local" ou "delivery"
    status = db.Column(db.String(30), nullable=False, default="aguardando")
    total = db.Column(db.Float, nullable=False, default=0.0)
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

    def to_dict(self, incluir_historico=False):
        dados = {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "tipo": self.tipo,
            "status": self.status,
            "total": self.total,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
            "itens": [item.to_dict() for item in self.itens],
        }
        if incluir_historico:
            dados["historico"] = [h.to_dict() for h in self.historico]
        return dados


class ItemPedido(db.Model):
    __tablename__ = "item_pedido"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedido.id"), nullable=False)
    nome_item = db.Column(db.String(120), nullable=False)
    tipo_item = db.Column(db.String(20), nullable=False)  # "pizza", "bebida", "combo"
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    preco_unitario = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nome_item": self.nome_item,
            "tipo_item": self.tipo_item,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
        }


class HistoricoStatus(db.Model):
    __tablename__ = "historico_status"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedido.id"), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    mudou_em = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"status": self.status, "mudou_em": self.mudou_em.isoformat()}
