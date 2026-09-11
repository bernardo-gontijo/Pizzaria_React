import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  cadastrarCliente as cadastrarClienteService,
  getClienteSessao,
  loginCliente as loginClienteService,
  logoutCliente as logoutClienteService,
  type ClienteAuth,
} from "../api/clienteAuth.service";

interface ClienteAuthContextData {
  usuario: ClienteAuth | null;
  autenticado: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (
    nome: string,
    email: string,
    senha: string,
  ) => Promise<void>;
  logout: () => void;
}

const ClienteAuthContext = createContext<
  ClienteAuthContextData | undefined
>(undefined);

export function ClienteAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const sessaoInicial = getClienteSessao();

  const [usuario, setUsuario] = useState<ClienteAuth | null>(
    sessaoInicial?.usuario ?? null,
  );
  const [loading, setLoading] = useState(false);

  async function login(email: string, senha: string) {
    try {
      setLoading(true);

      const sessao = await loginClienteService(email, senha);

      setUsuario(sessao.usuario);
    } finally {
      setLoading(false);
    }
  }

  async function cadastrar(
    nome: string,
    email: string,
    senha: string,
  ) {
    try {
      setLoading(true);

      await cadastrarClienteService(nome, email, senha);
      const sessao = await loginClienteService(email, senha);

      setUsuario(sessao.usuario);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutClienteService();
    setUsuario(null);
  }

  return (
    <ClienteAuthContext.Provider
      value={{
        usuario,
        autenticado: usuario !== null,
        loading,
        login,
        cadastrar,
        logout,
      }}
    >
      {children}
    </ClienteAuthContext.Provider>
  );
}

export function useClienteAuth() {
  const context = useContext(ClienteAuthContext);

  if (!context) {
    throw new Error(
      "useClienteAuth deve ser utilizado dentro de ClienteAuthProvider",
    );
  }

  return context;
}