import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Garante que cada teste renderiza em uma árvore DOM limpa,
// evitando vazamento de estado entre testes.
afterEach(() => {
  cleanup();
});
