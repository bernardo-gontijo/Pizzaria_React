import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { Pizza } from "../features/loja/types/pizza";

// ========== TIPOS ==========

export interface CartItem {
  id: string;
  tipo?: "pizza" | "bebida" | "combo";
  pizza?: Pizza;
  nome: string;
  imagem?: string;
  precoUnitario: number;
  quantidade: number;
  tamanho?: string;
  observacoes?: string;
  ingredientesExtras?: string[];
}

export interface CupomAplicado {
  codigo: string;
  tipoDesconto: "percentual" | "fixo";
  valor: number;
  desconto: number;
}

export interface CartContextData {
  items: CartItem[];

  adicionarItem: (item: CartItem) => void;
  removerItem: (id: string) => void;
  alterarQuantidade: (id: string, quantidade: number) => void;
  limparCarrinho: () => void;

  cupomAplicado: CupomAplicado | null;
  aplicarCupom: (cupom: CupomAplicado) => void;
  removerCupom: () => void;

  subtotal: number;
  taxaEntrega: number;
  desconto: number;
  total: number;
}

// ========== REDUCER ==========

type CartAction =
  | {
      type: "ADICIONAR";
      payload: CartItem;
    }
  | {
      type: "REMOVER";
      payload: string;
    }
  | {
      type: "ALTERAR_QUANTIDADE";
      payload: {
        id: string;
        quantidade: number;
      };
    }
  | {
      type: "APLICAR_CUPOM";
      payload: CupomAplicado;
    }
  | {
      type: "REMOVER_CUPOM";
    }
  | {
      type: "LIMPAR";
    };

interface CartState {
  items: CartItem[];
  cupomAplicado: CupomAplicado | null;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADICIONAR": {
      const existente = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existente) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantidade: item.quantidade + action.payload.quantidade,
                }
              : item,
          ),
          cupomAplicado: null,
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
        cupomAplicado: null,
      };
    }

    case "REMOVER":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        cupomAplicado: null,
      };

    case "ALTERAR_QUANTIDADE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantidade: Math.max(1, action.payload.quantidade),
              }
            : item,
        ),
        cupomAplicado: null,
      };

    case "APLICAR_CUPOM":
      return {
        ...state,
        cupomAplicado: action.payload,
      };

    case "REMOVER_CUPOM":
      return {
        ...state,
        cupomAplicado: null,
      };

    case "LIMPAR":
      return {
        items: [],
        cupomAplicado: null,
      };

    default:
      return state;
  }
}

// ========== LOCAL STORAGE ==========

function carregarCarrinho(): CartState {
  const saved = localStorage.getItem("cart");

  if (!saved) {
    return {
      items: [],
      cupomAplicado: null,
    };
  }

  try {
    const dados = JSON.parse(saved) as Partial<CartState>;

    return {
      items: Array.isArray(dados.items) ? dados.items : [],
      cupomAplicado: dados.cupomAplicado ?? null,
    };
  } catch {
    return {
      items: [],
      cupomAplicado: null,
    };
  }
}

// ========== PROVIDER ==========

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, carregarCarrinho);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (total, item) => total + item.precoUnitario * item.quantidade,
        0,
      ),
    [state.items],
  );

  const taxaEntrega = 5;

  const desconto = Math.min(state.cupomAplicado?.desconto ?? 0, subtotal);

  const total = Math.max(subtotal + taxaEntrega - desconto, 0);

  const value: CartContextData = {
    items: state.items,

    adicionarItem: (item) =>
      dispatch({
        type: "ADICIONAR",
        payload: item,
      }),

    removerItem: (id) =>
      dispatch({
        type: "REMOVER",
        payload: id,
      }),

    alterarQuantidade: (id, quantidade) =>
      dispatch({
        type: "ALTERAR_QUANTIDADE",
        payload: {
          id,
          quantidade,
        },
      }),

    limparCarrinho: () =>
      dispatch({
        type: "LIMPAR",
      }),

    cupomAplicado: state.cupomAplicado,

    aplicarCupom: (cupom) =>
      dispatch({
        type: "APLICAR_CUPOM",
        payload: cupom,
      }),

    removerCupom: () =>
      dispatch({
        type: "REMOVER_CUPOM",
      }),

    subtotal,
    taxaEntrega,
    desconto,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser utilizado dentro de CartProvider");
  }

  return context;
}