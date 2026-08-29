import { useState } from "react";
import { useTenantConfig } from "../../../context/TenantConfigContext";
import { salvarConfiguracao } from "../api/configuracao.service";
import type { PaymentMethod } from "../../loja/types/tenant";

const TODAS_FORMAS: PaymentMethod[] = ["pix", "cartao", "dinheiro"];

export function ConfiguracaoPage() {
  const { config, atualizarConfig } = useTenantConfig();
  const [form, setForm] = useState(config);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const salvo = await salvarConfiguracao(form);
    atualizarConfig(salvo); // dispara o useEffect do Passo 1 → tema muda na hora
  }

  function alternarFormaPagamento(forma: PaymentMethod) {
    setForm((atual) => ({
      ...atual,
      formasPagamentoHabilitadas: atual.formasPagamentoHabilitadas.includes(
        forma,
      )
        ? atual.formasPagamentoHabilitadas.filter((f) => f !== forma)
        : [...atual.formasPagamentoHabilitadas, forma],
    }));
  }

  return (
    <section className="max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Customização da loja</h1>
      <form onSubmit={salvar} className="space-y-3">
        <input
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Nome da pizzaria"
          className="w-full rounded border px-3 py-2"
        />

        <input
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          placeholder="URL do logotipo"
          className="w-full rounded border px-3 py-2"
        />

        <div className="flex gap-3">
          <label className="flex-1">
            Cor primária
            <input
              type="color"
              value={form.corPrimaria}
              onChange={(e) =>
                setForm({ ...form, corPrimaria: e.target.value })
              }
              className="block w-full"
            />
          </label>
          <label className="flex-1">
            Cor secundária
            <input
              type="color"
              value={form.corSecundaria}
              onChange={(e) =>
                setForm({ ...form, corSecundaria: e.target.value })
              }
              className="block w-full"
            />
          </label>
        </div>
        
        <label className="flex-1">
          Endereço:
          <input
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            placeholder="Endereço"
            className="w-full rounded border px-3 py-2"
          />
        </label>
        
        <label className="flex-1">
          Horário de Funcionamento:
          <input
            value={form.horarioFuncionamento}
            onChange={(e) =>
              setForm({ ...form, horarioFuncionamento: e.target.value })
            }
            placeholder="Horário de funcionamento"
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <label className="flex-1">
          Taxa de Entrega:          
          <input
            type="number"
            step="0.01"
            value={form.taxaEntrega}
            onChange={(e) =>
              setForm({ ...form, taxaEntrega: Number(e.target.value) })
            }
            placeholder="Taxa de entrega"
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <label className="flex-1">
          Raio de Entrega:  
          <input
            type="number"
            value={form.raioEntregaKm}
            onChange={(e) =>
              setForm({ ...form, raioEntregaKm: Number(e.target.value) })
            }
            placeholder="Raio de entrega (km)"
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <label className="flex-1">
          Tempo Médio de Preparo: 
          <input
            type="number"
            value={form.tempoMedioPreparoMin}
            onChange={(e) =>
              setForm({ ...form, tempoMedioPreparoMin: Number(e.target.value) })
            }
            placeholder="Tempo médio de preparo (min)"
            className="w-full rounded border px-3 py-2"
          />
        </label>

        <div>
          <p className="mb-1 font-medium">Formas de pagamento habilitadas</p>
          {TODAS_FORMAS.map((forma) => (
            <label key={forma} className="mr-4 inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.formasPagamentoHabilitadas.includes(forma)}
                onChange={() => alternarFormaPagamento(forma)}
              />
              {forma}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-primaria px-4 py-2 font-semibold text-white"
        >
          Salvar configuração
        </button>
      </form>
    </section>
  );
}
