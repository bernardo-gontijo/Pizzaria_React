import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { CartItem, CartContextData } from "../store/cart.store";

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
      type: "LIMPAR";
    };

interface CartState {
  items: CartItem[];
}

const CartContext = createContext<CartContextData | undefined>(undefined);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADICIONAR":
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVER":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "ALTERAR_QUANTIDADE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantidade: action.payload.quantidade,
              }
            : item,
        ),
      };

    case "LIMPAR":
      return {
        items: [],
      };

    default:
      return state;
  }
}

function carregarCarrinho(): CartState {
  const saved = localStorage.getItem("cart");

  if (!saved) {
    return { items: [] };
  }

  try {
    return JSON.parse(saved) as CartState;
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, carregarCarrinho);

  localStorage.setItem("cart", JSON.stringify(state));

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (total, item) => total + item.precoUnitario * item.quantidade,
        0,
      ),
    [state.items],
  );

  const taxaEntrega = 5;

  const total = subtotal + taxaEntrega;

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

    subtotal,
    taxaEntrega,
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
