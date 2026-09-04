# REACT ATÉ MORRER!!!

# 🍕 Pizzaria do Berna!

Plataforma completa de pedidos de pizzaria, com loja para o cliente final e painel administrativo para gestão do negócio. Construída como um Progressive Web App (PWA) com React, TypeScript e Vite.

## Visão geral

O projeto cobre o fluxo completo de uma pizzaria digital: o cliente navega pelo cardápio (pizzas, bebidas e combos), monta o carrinho, finaliza o pedido e acompanha a entrega em tempo real. Do outro lado, o administrador gerencia o cardápio, acompanha pedidos e personaliza a identidade visual da loja (white-label). Internamente, o pedido passa pela cozinha (preparo) e pelo entregador (entrega), enquanto o garçom atende mesas presenciais no salão.

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
│   ├── garcom/       # Área do garçom (mesas e pedidos presenciais)
│   ├── cozinheiro/   # Área da cozinha (fila de preparo)
│   ├── entregador/   # Área do entregador (entregas)
│   └── loja/         # Loja pública
│       ├── api/, components/, hooks/, pages/, types/
├── pwa/              # Registro do Service Worker
├── store/            # Estado do carrinho
└── test/             # Configuração global de testes
```

Os dados (pizzas, bebidas, combos, pedidos, mesas) são persistidos no `localStorage` do navegador, simulando uma API com atraso de rede artificial. A camada de serviços (`api/`) já isola essa lógica, facilitando a substituição por um backend real no futuro.

## Módulo: Loja

| Tela | Funcionalidade |
| ---- | -------------- |
| Cardápio | Pizzas, bebidas e combos, com filtro por categoria |
| Combos e Promoções | Pacotes de itens reais do cardápio com desconto |
| Detalhe do produto | Informações completas de pizza ou bebida |
| Carrinho | Adicionar/remover itens, alterar quantidade, cálculo automático de subtotal e taxa de entrega |
| Checkout | Formulário de dados do cliente e endereço, com preenchimento automático via CEP |
| Pagamento | Seleção da forma de pagamento, com QR Code para PIX |
| Acompanhamento | Status do pedido em tempo real (pendente → confirmado → preparando → pronto → entregue) |
| Meus Pedidos | Histórico de pedidos do cliente |

O carrinho persiste no `localStorage`: se o cliente fechar a aba no meio da compra, os itens continuam salvos.

## Módulo: Administração

| Tela | Funcionalidade |
| ---- | -------------- |
| Login | Autenticação do administrador |
| Dashboard | Total de pedidos, pedidos do dia, faturamento, pedidos entregues |
| Gestão de Pizzas | CRUD completo do cardápio |
| Gestão de Combos | Criação de combos escolhendo pizzas/bebidas reais do cardápio, definindo apenas o percentual de desconto |
| Gestão de Mesas | Cadastro e remoção de mesas do salão, organizadas por fileira |
| Gestão de Pedidos | Visualização de pedidos e alteração de status |
| Configuração | Personalização da marca: nome, cores, logo (white-label) |

A alteração de status feita pelo admin reflete automaticamente na tela de acompanhamento do cliente, via sistema de eventos — sem necessidade de recarregar a página.

## Módulo: Garçom

Área própria e independente (login e rotas protegidas separadas do admin), para atendimento presencial das mesas do salão.

| Tela | Funcionalidade |
| ---- | -------------- |
| Login | Autenticação do garçom |
| Mesas | Grade de mesas (livre/ocupada), organizadas por fileira conforme configurado pelo admin |
| Pedido da mesa | Adiciona itens ao pedido conforme o atendimento avança, e encerra a conta |

Um pedido por mesa, editável durante o atendimento. Ao encerrar a conta, a mesa fica livre novamente, o registro é preservado para prestação de contas, e o garçom pode registrar uma gorjeta opcional (10%, 15% ou 20%, a critério do cliente).

## Módulo: Cozinha

Fila de pedidos pendentes de preparo. A cozinha confirma o recebimento e avança o status até o pedido ficar pronto para entrega, sem necessidade de login.

## Módulo: Entregador

Área própria com login, listando as entregas em andamento. O entregador atualiza o status até a conclusão, encerrando o ciclo do pedido.

## PWA e Performance

- **Progressive Web App**: manifest configurado, ícones customizados, funcionamento offline, instalável em celular/desktop
- **Cache do cardápio**: estratégia _stale-while-revalidate_ — serve dados rapidamente do cache e busca atualização em segundo plano
- **Lazy loading de rotas**: cada página é carregada sob demanda, reduzindo o tamanho do carregamento inicial
- **Responsividade**: interface adaptada para celular, tablet e desktop

## Qualidade de código e testes

- **Vitest + React Testing Library** para testes automatizados
- **ESLint + Prettier** para padronização
- **TypeScript** em 100% do projeto, sem uso de `any`
- **49 testes automatizados**, cobrindo admin (cadastro de pizzas, dashboard, pedidos), loja (cardápio, checkout com CEP) e cozinha
- 0 erros de lint, 0 erros de tipo, código 100% formatado

Os testes cobrem cálculos de negócio (subtotal, total, faturamento), fluxos de interação (cadastro/edição/exclusão, alteração de status), casos de erro (falha de rede, resposta inválida) e persistência de dados entre sessões.

Durante o desenvolvimento, uma mudança de arquitetura no sistema de pedidos quebrou parte da suíte de testes. A investigação revelou um bug real: o cardápio ficava preso numa versão desatualizada no navegador do cliente mesmo após atualizações no catálogo. A correção introduziu um sistema de versionamento de cache que invalida automaticamente dados antigos. O mesmo cuidado foi aplicado aos combos, que também vivem inteiramente no `localStorage`.

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

- Tela de consulta ao histórico de mesas (relatório de prestação de contas)
- Avaliação/nota do estabelecimento no cardápio
- Notificações push quando o status do pedido mudar

## Stack

**Core:** React 19 · TypeScript · Vite
**Roteamento e formulários:** React Router · React Hook Form · Zod
**Estado e dados:** Zustand · TanStack Query
**PWA:** Vite PWA Plugin · Workbox
**Ícones e extras:** Lucide React · qrcode.react
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

## Acesso do garçom (ambiente de desenvolvimento)

**E-mail:**

```
garcom@pizzashop.com
```

**Senha:**

```
123456
```

## Acesso do entregador (ambiente de desenvolvimento)

**E-mail:**

```
entregador@pizzashop.com
```

**Senha:**

```
123456
```

> Credenciais fixas (mock) para fins de demonstração — não há backend de autenticação real. A área da cozinha não exige login.
