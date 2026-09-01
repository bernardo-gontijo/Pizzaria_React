# REACT ATÉ MORRER!!!

# 🍕 Pizzaria do Berna!

Plataforma completa de pedidos de pizzaria, com loja para o cliente final e painel administrativo para gestão do negócio. Construída como um Progressive Web App (PWA) com React, TypeScript e Vite.

## Visão geral

O projeto cobre o fluxo completo de uma pizzaria digital: o cliente navega pelo cardápio, monta o carrinho, finaliza o pedido e acompanha a entrega em tempo real. Do outro lado, o administrador gerencia o cardápio, acompanha pedidos e personaliza a identidade visual da loja (white-label).

## Arquitetura

O código é organizado por **funcionalidade**, não por tipo de arquivo — cada módulo é autocontido, com seus próprios componentes, hooks, páginas e serviços de dados.

```
src/
├── app/              # Configuração de rotas
├── components/       # Componentes compartilhados (Header, Footer, Layout)
├── context/          # Estado global (Carrinho, Configuração da loja)
├── features/
│   ├── admin/        # Área administrativa
│   │   ├── api/         # Serviços de dados
│   │   ├── components/  # Componentes específicos do admin
│   │   ├── hooks/       # Lógica reutilizável
│   │   ├── pages/       # Telas
│   │   └── utils/       # Formatação (moeda, data, status)
│   └── loja/         # Loja pública
│       ├── api/, components/, hooks/, pages/, types/
├── pwa/              # Registro do Service Worker
├── store/            # Estado do carrinho
└── test/             # Configuração global de testes
```

Os dados (pizzas, pedidos) são persistidos no `localStorage` do navegador, simulando uma API com atraso de rede artificial. A camada de serviços (`api/`) já isola essa lógica, facilitando a substituição por um backend real no futuro.

## Módulo: Loja

| Tela             | Funcionalidade                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Cardápio         | Lista de pizzas disponíveis com filtro por categoria                                          |
| Detalhe da pizza | Informações completas e ingredientes                                                          |
| Carrinho         | Adicionar/remover itens, alterar quantidade, cálculo automático de subtotal e taxa de entrega |
| Checkout         | Formulário de dados do cliente e endereço                                                     |
| Pagamento        | Seleção da forma de pagamento                                                                 |
| Acompanhamento   | Status do pedido em tempo real (pendente → confirmado → preparando → pronto → entregue)       |

O carrinho persiste no `localStorage`: se o cliente fechar a aba no meio da compra, os itens continuam salvos.

## Módulo: Administração

| Tela              | Funcionalidade                                                   |
| ----------------- | ---------------------------------------------------------------- |
| Login             | Autenticação do administrador                                    |
| Dashboard         | Total de pedidos, pedidos do dia, faturamento, pedidos entregues |
| Gestão de Pizzas  | CRUD completo do cardápio                                        |
| Gestão de Pedidos | Visualização de pedidos e alteração de status                    |
| Configuração      | Personalização da marca: nome, cores, logo (white-label)         |

A alteração de status feita pelo admin reflete automaticamente na tela de acompanhamento do cliente, via sistema de eventos — sem necessidade de recarregar a página.

## Acesso administrativo (ambiente de desenvolvimento)

```
E-mail: admin@pizzashop.com
Senha: 123456
```

> Credenciais fixas (mock) para fins de demonstração — não há backend de autenticação real.

## PWA e Performance

- **Progressive Web App**: manifest configurado, ícones customizados, funcionamento offline, instalável em celular/desktop
- **Cache do cardápio**: estratégia _stale-while-revalidate_ — serve dados rapidamente do cache e busca atualização em segundo plano
- **Lazy loading de rotas**: cada página é carregada sob demanda, reduzindo o tamanho do carregamento inicial
- **Responsividade**: interface adaptada para celular, tablet e desktop

## Qualidade de código e testes

- **Vitest + React Testing Library** para testes automatizados
- **ESLint + Prettier** para padronização
- **TypeScript** em 100% do projeto, sem uso de `any`
- **25+ testes automatizados**, cobrindo admin (cadastro de pizzas, dashboard, pedidos) e loja (cardápio, carrinho)
- 0 erros de lint, 0 erros de tipo, código 100% formatado

Os testes cobrem cálculos de negócio (subtotal, total, faturamento), fluxos de interação (cadastro/edição/exclusão, alteração de status), casos de erro (falha de rede, resposta inválida) e persistência de dados entre sessões.

Durante o desenvolvimento, uma mudança de arquitetura no sistema de pedidos quebrou parte da suíte de testes. A investigação revelou um bug real: o cardápio ficava preso numa versão desatualizada no navegador do cliente mesmo após atualizações no catálogo. A correção introduziu um sistema de versionamento de cache que invalida automaticamente dados antigos.

## Estrutura de branches

- `main` — versão estável do projeto
- `feature/nome-da-feature` — desenvolvimento de novas funcionalidades
- `fix/nome-do-bug` — correções de bugs

## Como contribuir

1. Crie uma branch a partir da `main`: `feature/nome-da-feature` ou `fix/nome-do-bug`
2. Rode a suíte de verificação antes de commitar: `npm test`, `npx tsc -b --noEmit`, `npm run lint:eslint`
3. Abra um Pull Request para a `main`
4. Após o merge, delete a branch (mantém o repositório organizado)

## Como rodar o projeto

```bash
npm install                  # instala as dependências

npm run dev                  # ambiente de desenvolvimento
npm run build                # build de produção
npm run preview              # visualiza o build de produção localmente

npm test                     # roda a suíte de testes uma vez
npm run test:watch           # roda os testes em modo observador
npm run test:coverage        # roda os testes com relatório de cobertura

npm run lint                 # lint rápido (oxlint)
npm run lint:eslint          # lint completo (ESLint)
npm run format                # formata o projeto com Prettier
npm run format:check          # verifica formatação sem alterar arquivos
```

## Próximos passos

Funcionalidades em planejamento (acompanhe nas [Issues](https://github.com/bernardo-gontijo/Pizzaria_React/issues)):

- Área exclusiva para garçom (vínculo de pedidos a mesas, cálculo de gorjeta)
- Papéis de cozinheiro e entregador, avançando o status do pedido
- Geração de QR Code para pagamento via PIX
- Preenchimento automático de endereço via API de CEP

## Stack

**Core:** React 19 · TypeScript · Vite
**Roteamento e formulários:** React Router · React Hook Form · Zod
**Estado e dados:** Zustand · TanStack Query
**PWA:** Vite PWA Plugin · Workbox
**Testes e qualidade:** Vitest · React Testing Library · ESLint · Prettier

## Acesso administrativo (ambiente de desenvolvimento)

**E-mail:**

```
admin@pizzashop.com
```

**Senha:**

```
123456
```

> Credenciais fixas (mock) para fins de demonstração — não há backend de autenticação real.
