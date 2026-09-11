import json
from datetime import datetime

from sqlalchemy import event
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

    cliente_nome = db.Column(db.String(120), nullable=True)
    cliente_email = db.Column(db.String(120), nullable=True)
    cliente_telefone = db.Column(db.String(30), nullable=True)

    endereco = db.Column(db.Text, nullable=True)

    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    taxa_entrega = db.Column(db.Float, nullable=False, default=0.0)
    desconto = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)

    forma_pagamento = db.Column(db.String(30), nullable=True)
    troco_para = db.Column(db.Float, nullable=True)
    observacoes = db.Column(db.Text, nullable=True)

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

    pizza_id = db.Column(db.String(50), nullable=True)
    nome_item = db.Column(db.String(120), nullable=False)
    tipo_item = db.Column(db.String(20), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    preco_unitario = db.Column(db.Float, nullable=False)
    tamanho = db.Column(db.String(5), nullable=True)
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


class Cupom(db.Model):
    __tablename__ = "cupom"

    id = db.Column(db.Integer, primary_key=True)

    codigo = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    tipo_desconto = db.Column(
        db.String(20),
        nullable=False,
    )

    valor = db.Column(
        db.Float,
        nullable=False,
    )

    data_inicio = db.Column(
        db.DateTime,
        nullable=True,
    )

    data_fim = db.Column(
        db.DateTime,
        nullable=True,
    )

    pedido_minimo = db.Column(
        db.Float,
        nullable=False,
        default=0.0,
    )

    limite_usos_total = db.Column(
        db.Integer,
        nullable=True,
    )

    limite_usos_por_cliente = db.Column(
        db.Integer,
        nullable=True,
    )

    ativo = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    usos = db.relationship(
        "UsoCupom",
        backref="cupom",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def validar(self):
        self.codigo = self.codigo.strip().upper() if self.codigo else ""

        if not self.codigo:
            raise ValueError("O código do cupom é obrigatório")

        if self.tipo_desconto not in {"percentual", "fixo"}:
            raise ValueError("Tipo de desconto inválido")

        if self.valor is None or self.valor <= 0:
            raise ValueError("O valor do desconto deve ser maior que zero")

        if self.tipo_desconto == "percentual" and self.valor > 100:
            raise ValueError("O desconto percentual não pode ser maior que 100%")

        if self.pedido_minimo is not None and self.pedido_minimo < 0:
            raise ValueError("O pedido mínimo não pode ser negativo")

        if self.limite_usos_total is not None and self.limite_usos_total <= 0:
            raise ValueError("O limite total de usos deve ser maior que zero")

        if (
            self.limite_usos_por_cliente is not None
            and self.limite_usos_por_cliente <= 0
        ):
            raise ValueError("O limite de usos por cliente deve ser maior que zero")

        if (
            self.data_inicio is not None
            and self.data_fim is not None
            and self.data_fim < self.data_inicio
        ):
            raise ValueError("A data final não pode ser anterior à data inicial")

    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "tipoDesconto": self.tipo_desconto,
            "valor": self.valor,
            "dataInicio": (self.data_inicio.isoformat() if self.data_inicio else None),
            "dataFim": (self.data_fim.isoformat() if self.data_fim else None),
            "pedidoMinimo": self.pedido_minimo,
            "limiteUsosTotal": self.limite_usos_total,
            "limiteUsosPorCliente": self.limite_usos_por_cliente,
            "ativo": self.ativo,
            "criadoEm": (self.criado_em.isoformat() if self.criado_em else None),
            "atualizadoEm": (
                self.atualizado_em.isoformat() if self.atualizado_em else None
            ),
        }


class UsoCupom(db.Model):
    __tablename__ = "uso_cupom"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    cupom_id = db.Column(
        db.Integer,
        db.ForeignKey("cupom.id"),
        nullable=False,
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuario.id"),
        nullable=False,
    )

    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey("pedido.id"),
        nullable=True,
    )

    desconto_aplicado = db.Column(
        db.Float,
        nullable=False,
        default=0.0,
    )

    usado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    usuario = db.relationship(
        "Usuario",
        backref="usos_cupom",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "cupomId": self.cupom_id,
            "usuarioId": self.usuario_id,
            "pedidoId": self.pedido_id,
            "descontoAplicado": self.desconto_aplicado,
            "usadoEm": (self.usado_em.isoformat() if self.usado_em else None),
        }


@event.listens_for(Cupom, "before_insert")
@event.listens_for(Cupom, "before_update")
def validar_cupom_antes_de_salvar(mapper, connection, target):
    target.validar()


class Avaliacao(db.Model):
    __tablename__ = "avaliacao"

    id = db.Column(db.Integer, primary_key=True)

    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey("pedido.id"),
        nullable=False,
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuario.id"),
        nullable=False,
    )

    pizza_id = db.Column(db.String(50), nullable=False, index=True)
    pizza_nome = db.Column(db.String(120), nullable=False)

    nota = db.Column(db.Float, nullable=False)
    comentario = db.Column(db.Text, nullable=True)

    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    pedido = db.relationship("Pedido", backref="avaliacoes")
    usuario = db.relationship("Usuario", backref="avaliacoes")

    __table_args__ = (
        db.UniqueConstraint(
            "pedido_id",
            "pizza_id",
            name="uma_avaliacao_por_pizza_por_pedido",
        ),
    )

    def to_dict(self, incluir_cliente=False):
        dados = {
            "id": self.id,
            "pedidoId": self.pedido_id,
            "pizzaId": self.pizza_id,
            "pizzaNome": self.pizza_nome,
            "nota": self.nota,
            "comentario": self.comentario,
            "criadoEm": self.criado_em.isoformat(),
        }
        if incluir_cliente:
            dados["clienteNome"] = self.usuario.nome if self.usuario else None
        return dados
