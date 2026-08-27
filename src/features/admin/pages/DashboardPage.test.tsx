// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import type { Order } from '../../../store/order.store';
import { DashboardPage } from './DashboardPage';

const agora = new Date().toISOString();

const pedidosTeste = [
  {
    id: 'pedido-1',
    itens: [],
    cliente: {
      nome: 'João',
      telefone: '92999999999',
      endereco: 'Rua Principal',
      numero: '100',
      bairro: 'Centro',
    },
    formaPagamento: 'pix',
    subtotal: 50,
    taxaEntrega: 5,
    total: 55,
    status: 'entregue',
    criadoEm: agora,
  },
  {
    id: 'pedido-2',
    itens: [],
    cliente: {
      nome: 'Maria',
      telefone: '92988888888',
      endereco: 'Rua Dois',
      numero: '200',
      bairro: 'Centro',
    },
    formaPagamento: 'pix',
    subtotal: 25,
    taxaEntrega: 5,
    total: 30,
    status: 'preparo',
    criadoEm: agora,
  },
] as Order[];

beforeEach(() => {
  localStorage.clear();

  localStorage.setItem(
    'pizzashop-pedidos',
    JSON.stringify(pedidosTeste),
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('DashboardPage', () => {
  it('calcula corretamente os dados dos pedidos', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      const totalPedidos = screen
        .getByRole('heading', {
          name: 'Total de pedidos',
        })
        .closest('article');

      expect(totalPedidos).not.toBeNull();

      expect(
        within(totalPedidos!).getByText('2'),
      ).toBeInTheDocument();
    });

    const pedidosHoje = screen
      .getByRole('heading', {
        name: 'Pedidos de hoje',
      })
      .closest('article');

    expect(
      within(pedidosHoje!).getByText('2'),
    ).toBeInTheDocument();

    const entregues = screen
      .getByRole('heading', {
        name: 'Pedidos entregues',
      })
      .closest('article');

    expect(
      within(entregues!).getByText('1'),
    ).toBeInTheDocument();
  });

  it('calcula corretamente o faturamento', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText('R$ 85,00'),
      ).toHaveLength(2);
    });
  });
});