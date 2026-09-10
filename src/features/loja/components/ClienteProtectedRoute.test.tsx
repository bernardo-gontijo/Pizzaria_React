import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ClienteProtectedRoute } from "./ClienteProtectedRoute";
import { useClienteAuth } from "../hooks/ClienteAuthContext";

vi.mock("../hooks/ClienteAuthContext", () => ({
  useClienteAuth: vi.fn(),
}));

const mockUseClienteAuth = vi.mocked(useClienteAuth);

function renderRota() {
  return render(
    <MemoryRouter initialEntries={["/meus-pedidos"]}>
      <Routes>
        <Route element={<ClienteProtectedRoute />}>
          <Route
            path="/meus-pedidos"
            element={<h1>Meus pedidos</h1>}
          />
        </Route>

        <Route
          path="/login"
          element={<h1>Login do cliente</h1>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ClienteProtectedRoute", () => {
  it("redireciona usuário não autenticado para o login", () => {
    mockUseClienteAuth.mockReturnValue({
      usuario: null,
      autenticado: false,
      loading: false,
      login: vi.fn(async () => undefined),
      cadastrar: vi.fn(async () => undefined),
      logout: vi.fn(),
    });

    renderRota();

    expect(
      screen.getByRole("heading", {
        name: "Login do cliente",
      }),
    ).toBeInTheDocument();
  });

  it("libera a rota quando o cliente está autenticado", () => {
    mockUseClienteAuth.mockReturnValue({
      usuario: {
        id: 1,
        nome: "Kauan",
        email: "kauan@teste.com",
        role: "cliente",
      },
      autenticado: true,
      loading: false,
      login: vi.fn(async () => undefined),
      cadastrar: vi.fn(async () => undefined),
      logout: vi.fn(),
    });

    renderRota();

    expect(
      screen.getByRole("heading", {
        name: "Meus pedidos",
      }),
    ).toBeInTheDocument();
  });
});