// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import type { Order } from '../../../store/order.store';
import { PedidoAdminPage } from './PedidoAdminPage';

const pedidoTeste = {
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

  status: 'recebido',

  criadoEm: new Date().toISOString(),
} as Order;

beforeEach(() => {
  localStorage.clear();

  localStorage.setItem(
    'pizzashop-pedidos',
    JSON.stringify([pedidoTeste]),
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('PedidoAdminPage', () => {
  it('carrega os pedidos cadastrados', async () => {
    render(<PedidoAdminPage />);

    expect(
      await screen.findByText('João'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('R$ 55,00'),
    ).toBeInTheDocument();

    const status = screen.getByLabelText(
      'Status do pedido pedido-1',
    );

    expect(status).toHaveValue('recebido');
  });

  it('permite alterar o status do pedido', async () => {
    render(<PedidoAdminPage />);

    const campoStatus =
      await screen.findByLabelText(
        'Status do pedido pedido-1',
      );

    fireEvent.change(campoStatus, {
      target: {
        value: 'preparo',
      },
    });

    await waitFor(() => {
      expect(campoStatus).toHaveValue(
        'preparo',
      );
    });

    const pedidosSalvos = JSON.parse(
      localStorage.getItem(
        'pizzashop-pedidos',
      ) ?? '[]',
    ) as Order[];

    expect(
      pedidosSalvos[0].status,
    ).toBe('preparo');
  });
});