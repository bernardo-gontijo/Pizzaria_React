
const STORAGE_KEY = '@entregador:user';

export interface EntregadorUser {
  id: string;
  nome: string;
  email: string;
  role: 'entregador';
}

// Credenciais mock para demonstração (igual ao padrão do garçom)
const MOCK_ENTREGADOR: EntregadorUser = {
  id: '1',
  nome: 'Carlos Silva',
  email: 'entregador@pizzashop.com',
  role: 'entregador',
};

// Credenciais válidas
const VALID_CREDENTIALS = {
  email: 'entregador@pizzashop.com',
  senha: '123456',
};

export const entregadorAuthService = {
  /**
   * Realiza o login do entregador
   * @param email - Email do entregador
   * @param senha - Senha do entregador
   * @returns Dados do entregador logado
   * @throws Error se as credenciais forem inválidas
   */
  login(email: string, senha: string): EntregadorUser {
    if (email === VALID_CREDENTIALS.email && senha === VALID_CREDENTIALS.senha) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ENTREGADOR));
      return MOCK_ENTREGADOR;
    }
    throw new Error('Credenciais inválidas. Use: entregador@pizzashop.com / 123456');
  },

  /**
   * Realiza o logout do entregador
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Retorna os dados do entregador logado
   * @returns Dados do entregador ou null se não estiver logado
   */
  getUser(): EntregadorUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as EntregadorUser;
    } catch {
      return null;
    }
  },

  /**
   * Verifica se o entregador está autenticado
   * @returns true se estiver autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getUser();
  },

  /**
   * Retorna o nome do entregador ou 'Entregador' como fallback
   */
  getNome(): string {
    const user = this.getUser();
    return user?.nome || 'Entregador';
  },

  /**
   * Atualiza os dados do entregador no localStorage
   */
  updateUser(user: Partial<EntregadorUser>): void {
    const current = this.getUser();
    if (current) {
      const updated = { ...current, ...user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  },
};