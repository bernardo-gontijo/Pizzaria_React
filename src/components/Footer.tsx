import { useTenantConfig } from "../context/TenantConfigContext";

export function Footer() {
  const { config } = useTenantConfig();

  return (
    <footer className="footer" id="contato">
      <strong>{config.nome}</strong>
      <span>{config.endereco}</span>
      <span>Atendimento: {config.horarioFuncionamento}</span>
    </footer>
  );
}
