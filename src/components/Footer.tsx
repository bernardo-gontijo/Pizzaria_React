import { useTenantConfig } from "../context/TenantConfigContext";

export function Footer() {
  const { config } = useTenantConfig();
  return (
    <footer className="footer">
      <strong>{config.nome}</strong>
      <span>{config.endereco}</span>
      <span>{config.horarioFuncionamento}</span>
    </footer>
  );
}
