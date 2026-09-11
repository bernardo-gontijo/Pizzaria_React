import { createContext, useContext, useState, type ReactNode } from "react";

import {
  entregadorAuthService,
  type EntregadorUser,
} from "../services/entregadorAuth.service";

interface EntregadorAuthContextData {
  user: EntregadorUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const EntregadorAuthContext = createContext(
  undefined as EntregadorAuthContextData | undefined,
);

export function EntregadorAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<EntregadorUser | null>(
    entregadorAuthService.getUser(),
  );

  const [loading, setLoading] = useState(false);

  async function login(email: string, senha: string) {
    try {
      setLoading(true);

      const authenticatedUser = await entregadorAuthService.login(
        email,
        senha,
      );

      setUser(authenticatedUser);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    entregadorAuthService.logout();
    setUser(null);
  }

  return (
    <EntregadorAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </EntregadorAuthContext.Provider>
  );
}

export function useEntregadorAuth() {
  const context = useContext(EntregadorAuthContext);

  if (!context) {
    throw new Error(
      "useEntregadorAuth deve ser utilizado dentro de EntregadorAuthProvider",
    );
  }

  return context;
}
