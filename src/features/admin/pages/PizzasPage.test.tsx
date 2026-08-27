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
  vi,
} from 'vitest';

import { PizzasPage } from './PizzasPage';

beforeEach(() => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '[]',
  } as Response);

  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('PizzasPage', () => {
  it('carrega e permite cadastrar uma pizza', async () => {
    render(<PizzasPage />);

    await screen.findByText(
      'Nenhuma pizza cadastrada.',
    );

    fireEvent.change(
      screen.getByLabelText('Nome'),
      {
        target: {
          value: 'Calabresa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Descrição'),
      {
        target: {
          value: 'Pizza de calabresa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Preço'),
      {
        target: {
          value: '45',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Ingredientes'),
      {
        target: {
          value: 'calabresa, queijo, cebola',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cadastrar pizza',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Calabresa',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('R$ 45,00'),
    ).toBeInTheDocument();
  });

  it('permite editar uma pizza', async () => {
    render(<PizzasPage />);

    await screen.findByText(
      'Nenhuma pizza cadastrada.',
    );

    fireEvent.change(
      screen.getByLabelText('Nome'),
      {
        target: {
          value: 'Calabresa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Descrição'),
      {
        target: {
          value: 'Pizza de calabresa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Preço'),
      {
        target: {
          value: '45',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Ingredientes'),
      {
        target: {
          value: 'calabresa, queijo',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cadastrar pizza',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Editar',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Editar pizza',
      }),
    ).toBeInTheDocument();

    const campoNome =
      screen.getByLabelText('Nome');

    fireEvent.change(campoNome, {
      target: {
        value: 'Calabresa Especial',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Salvar alterações',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Calabresa Especial',
      }),
    ).toBeInTheDocument();
  });

  it('permite excluir uma pizza', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(
      true,
    );

    render(<PizzasPage />);

    await screen.findByText(
      'Nenhuma pizza cadastrada.',
    );

    fireEvent.change(
      screen.getByLabelText('Nome'),
      {
        target: {
          value: 'Portuguesa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Descrição'),
      {
        target: {
          value: 'Pizza portuguesa',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Preço'),
      {
        target: {
          value: '50',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Ingredientes'),
      {
        target: {
          value: 'queijo, presunto, ovo',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cadastrar pizza',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Portuguesa',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Excluir',
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: 'Portuguesa',
        }),
      ).not.toBeInTheDocument();
    });
  });
});