import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useTenantConfig } from "../context/TenantConfigContext";
import { usePromocaoDoDia } from "../features/loja/hooks/usePromocaoDoDia";
import { useCombos } from "../features/loja/hooks/useCombos";
import { useCart } from "../context/CartContext";
import { CarrosselCombos } from "../features/loja/components/CarrosselCombos";
import { InfoCardsHome } from "../features/loja/components/InfoCardsHome";
import type { ComboResolvido } from "../features/loja/types/combos";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function HomePage() {
  const { config } = useTenantConfig();
  const { promocao } = usePromocaoDoDia();
  const { combos } = useCombos();
  const { adicionarItem } = useCart();
  const navigate = useNavigate();

  function handleAdicionarCombo(combo: ComboResolvido) {
    adicionarItem({
      id: combo.id,
      tipo: "combo",
      nome: combo.nome,
      imagem: combo.imagem,
      precoUnitario: combo.precoPromocional,
      quantidade: 1,
    });

    navigate("/carrinho");
  }

  return (
    <div className="home-pagina">
      {promocao ? (
        <section className="promocao-do-dia-card" aria-label="Pizza do dia">
          <img
            className="promocao-do-dia-card__imagem"
            src={promocao.pizza.imagem}
            alt={promocao.pizza.nome}
          />

          <div className="promocao-do-dia-card__conteudo">
            <span className="promocao-do-dia-card__selo">
              Promoção do dia
            </span>

            <h1>{promocao.pizza.nome}</h1>

            <p>{promocao.pizza.descricao}</p>

            <div className="promocao-do-dia-card__precos">
              <span>De {formatarMoeda(promocao.pizza.preco)} por</span>
              <strong>{formatarMoeda(promocao.precoComDesconto)}</strong>
            </div>

            <Link
              className="promocao-do-dia-card__botao"
              to={`/pizza/${promocao.pizza.id}`}
            >
              Aproveitar agora
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="promocao-do-dia-card promocao-do-dia-card--vazio">
          <div className="promocao-do-dia-card__conteudo">
            <h1>{config.nome}</h1>
            <p>
              Pizzas artesanais preparadas com ingredientes selecionados e
              entregues quentinhas para você.
            </p>

            <Link className="promocao-do-dia-card__botao" to="/cardapio">
              Conheça o cardápio
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <CarrosselCombos combos={combos} onAdicionar={handleAdicionarCombo} />

      <InfoCardsHome />
    </div>
  );
}