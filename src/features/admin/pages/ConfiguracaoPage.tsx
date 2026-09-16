import { useRef, useState } from "react";
import { useTenantConfig } from "../../../context/TenantConfigContext";
import { salvarConfiguracao } from "../api/configuracao.service";
import type { PaymentMethod } from "../../loja/types/tenant";

const TODAS_FORMAS: PaymentMethod[] = ["pix", "cartao", "dinheiro"];

// Limite conservador: o logotipo é guardado como data URL (base64) dentro
// da configuração salva no localStorage, então precisa caber com folga no
// limite de ~5MB por origem que os navegadores costumam impor.
const TAMANHO_MAXIMO_LOGO_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

export function ConfiguracaoPage() {
  const { config, atualizarConfig } = useTenantConfig();
  const [form, setForm] = useState(config);
  const [erroLogo, setErroLogo] = useState<string | null>(null);
  const [carregandoLogo, setCarregandoLogo] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

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

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois

    if (!arquivo) return;

    setErroLogo(null);

    if (!arquivo.type.startsWith("image/")) {
      setErroLogo("Escolha um arquivo de imagem (PNG, JPG, SVG...).");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_LOGO_BYTES) {
      setErroLogo(
        `Imagem muito grande. O limite é ${(
          TAMANHO_MAXIMO_LOGO_BYTES /
          1024 /
          1024
        ).toFixed(1)} MB.`,
      );
      return;
    }

    const leitor = new FileReader();

    setCarregandoLogo(true);

    leitor.onload = () => {
      setForm((atual) => ({
        ...atual,
        logoUrl: leitor.result as string,
      }));
      setCarregandoLogo(false);
    };

    leitor.onerror = () => {
      setErroLogo("Não foi possível ler essa imagem. Tente outro arquivo.");
      setCarregandoLogo(false);
    };

    leitor.readAsDataURL(arquivo);
  }

  function removerLogo() {
    setForm((atual) => ({ ...atual, logoUrl: "" }));
    setErroLogo(null);
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

        <div className="configuracao-logo">
          <p className="mb-1 font-medium">Logotipo</p>

          <div className="configuracao-logo__linha">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Pré-visualização do logotipo"
                className="configuracao-logo__preview"
              />
            ) : (
              <span className="configuracao-logo__preview configuracao-logo__preview--vazia">
                Sem logo
              </span>
            )}

            <div className="configuracao-logo__acoes">
              <button
                type="button"
                onClick={() => inputArquivoRef.current?.click()}
                disabled={carregandoLogo}
                className="rounded border px-3 py-2 font-semibold"
              >
                {carregandoLogo ? "Carregando..." : "Carregar imagem"}
              </button>

              {form.logoUrl && (
                <button
                  type="button"
                  onClick={removerLogo}
                  className="configuracao-logo__remover"
                >
                  Remover
                </button>
              )}
            </div>

            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/*"
              onChange={aoEscolherArquivo}
              className="configuracao-logo__input-arquivo"
            />
          </div>

          {erroLogo && (
            <p className="configuracao-logo__erro" role="alert">
              {erroLogo}
            </p>
          )}

          <details className="configuracao-logo__url-manual">
            <summary>Ou informar uma URL de imagem</summary>

            <input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
              className="w-full rounded border px-3 py-2"
            />
          </details>
        </div>

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