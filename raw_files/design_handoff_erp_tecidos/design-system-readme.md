# Dark System

Design system escuro, minimalista e funcional para produtos digitais (apps internos, painéis, ferramentas). Criado do zero neste projeto: nenhuma marca, codebase ou Figma foi fornecido. A origem é o arquivo de exploração `Dark System.dc.html` (fundações 1a, componentes 1b, tela aplicada 1c).

Idioma padrão das interfaces: **português (BR)**.

## Índice
- `styles.css`: ponto de entrada. Importe só este arquivo.
- `tokens/`: `colors.css`, `typography.css`, `spacing.css`, `fonts.css` e `base.css` (resets).
- `tokens/tokens.json`: os mesmos tokens no formato **Tokens Studio**, para importar no Figma.
- `guidelines/`: cards de fundação (cores, tipo, espaçamento, raio, elevação, estados, princípios).
- `components/`
  - `forms/`: Button, IconButton, Input, Select, Checkbox, RadioGroup, Switch, SegmentedControl, Textarea, SuggestionChip
  - `inputs/`: Combobox, DatePicker, FileUpload, Slider, CurrencyInput, SearchInput
  - `display/`: Badge, Tag, Card, Avatar, Kbd, Rating
  - `data/`: DataTable, Pagination, ActionList, Chart, EmptyState, Skeleton
  - `navigation/`: Tabs, Menu, NavItem, Popover
  - `erp/`: padrões nascidos no ERP — Sheet, StatCard, Swatch, ColorOption, StatusSteps, Stepper, DueIndicator (+ `dueInfo`), ChoiceTiles, ProportionBar, RankList, MatrixGrid, LedgerList
  - `agents/`: AgentCard, ApprovalCard, ChatPanel (módulo Agentes)
  - `layout/`: Sidebar, TopBar, Breadcrumb, Accordion
  - `feedback/`: Alert, Toast, Dialog, Tooltip, Progress, Spinner, InlineConfirm
- `ui_kits/orders/`: app de pedidos interativo (sidebar, tabela, detalhe, modal).
- `SKILL.md`: para usar este sistema no Claude Code.
- `Dark System.dc.html`: exploração original (referência).

## Três regras
1. **Um acento.** O azul `--accent` serve só para foco, seleção, links e estados "aberto". Nunca use em botões ou fundos grandes.
2. **Tinta para ação.** O botão primário é claro sobre escuro (`--primary-bg` #EDEDEA). Use um por tela.
3. **Bordas primeiro.** A hierarquia vem de superfície + borda. Sombra só em overlays (menus, toasts, diálogos).

## Clareza e foco (princípios de produto)
O sistema foi desenhado para uso sem esforço de atenção (o dono tem TDAH). Toda tela nova segue estas regras:
1. **Uma ação principal por tela,** sempre no canto superior direito, com atalho de teclado.
2. **O mais importante primeiro e maior.** O resto fica em text-2/text-3.
3. **Cor só com significado** e sempre acompanhada de texto.
4. **Posições fixas:** o mesmo elemento fica sempre no mesmo lugar em todos os módulos, sem desalinhamentos (grade de 4px, alturas fixas).
5. **Exclusão sempre pede confirmação** num diálogo (título "Excluir X?", consequência em uma frase, botão vermelho nomeando a ação, foco em Cancelar). O toast com "Desfazer" vem em seguida. Ações reversíveis (marcar, vincular) não pedem confirmação, só oferecem "Desfazer".
5b. **Listas em ordem alfabética por padrão** (pt-BR, sem diferenciar acentos), incluindo grupos, colunas e opções de seleção. As exceções são tarefas (por urgência) e registros com data, como vendas e pedidos (mais recentes primeiro).
6. **Progresso visível:** contadores que diminuem, barra do dia, "feito" com check verde. O feedback é **sutil**: transição de 320ms, sem confete.
7. **Salvar automaticamente** e mostrar "Salvo".
8. **Teclado primeiro:** ⌘K para tudo e atalhos nas ações principais.

## Agentes
1. **Aprovar antes de enviar.** Tudo que vai para o cliente ou mexe em dinheiro passa pela fila de aprovação (ApprovalCard). O padrão é pedir aprovação.
2. **Autonomia por tarefa,** nunca por agente inteiro. Avaliações de 1 a 3 estrelas sempre pedem aprovação.
3. **Desfazer, não confirmar.** Enviar e descartar mostram toast com Desfazer.
4. **O chat é para você,** não para o cliente: testar, perguntar por quê, ajustar. Ele lê as diretrizes e o catálogo atual.
5. **Respostas ao cliente:** curtas, com fatos do catálogo, sem prometer prazo ou desconto, sem emoji.

## CONTENT FUNDAMENTALS
- **Vocabulário do ERP:** use sempre "Quantidade" para unidades vendidas. Nunca "peças", "metros" ou "kg".
- **Tom:** direto, calmo, técnico sem jargão. Fala com "você", implícito na maior parte das vezes ("Selecione um pedido").
- **Caixa de frase** em tudo: títulos, botões, abas ("Novo pedido", não "Novo Pedido" nem "NOVO PEDIDO"). Maiúsculas só nas captions mono de grupo (via CSS).
- **Botões são verbos + objeto:** "Criar pedido", "Marcar como enviado", "Tentar cobrança". Nada de "OK" ou "Enviar" sem objeto.
- **Confirmações destrutivas** nomeiam o objeto e a consequência: "“Northwind Web” e seus 14 ambientes serão removidos. Isso não pode ser desfeito."
- **Toasts** no passado, curtos: "Pedido #1051 criado", "3 itens arquivados".
- **Estados vazios:** o que aconteceu + o que fazer: "Nenhum pedido encontrado. Tente outro filtro ou termo de busca."
- **Erros** dizem como corrigir: "Digite um e-mail completo." Não "E-mail inválido!".
- **Sem emoji, sem exclamação, sem reticências decorativas.** "…" só em itens de menu que abrem algo ("Mover para…").
- **Números, códigos, valores e atalhos** em Geist Mono: `PED-1048`, `R$ 1.240,00`, `⌘K`. Moeda no formato pt-BR.

## VISUAL FOUNDATIONS
- **Cor:** rampa neutra levemente quente, de #050506 a #EDEDEA (o texto não é branco puro). Os sinais são pastel-luminosos para manter contraste no escuro: acento #8AB4FF, sucesso #5FD49A, alerta #E9B65C, perigo #F07A6E. As versões suaves usam `color-mix` a 14% (badges) ou 6% (fundo de alerta).
- **Camadas:** canvas #050506 → bg #0B0B0C (app) → surface #111113 (painéis, cards) → raised #18181B (controles, menus) → hover #1F1F23. Cada camada sobe um degrau; não pule degraus.
- **Tipo:** Geist (400/500/600) para interface e Geist Mono (400/500) para dados. Densidade **Ampla** (escolhida para foco e leitura confortável): 34 / 22 / 17 / 15 / 14 / 13 / 11.5. Títulos com tracking negativo (-2% e -1%). Captions de grupo em mono 11px, maiúsculas, +8%.
- **Espaçamento:** grade de 4px. Gaps de 8–16 dentro de componentes e 24–32 entre seções. Padding de card: 20px.
- **Controles:** alturas 32 / 40 / 48. O padrão é 40. Botões e inputs compartilham a mesma altura. Itens de menu e navegação têm 36px (`--item-h`) e linhas de tabela e lista têm 52px (`--row-h`).
- **Raios:** 4 (chips, itens de menu, checkbox), 6 (botões, inputs), 10 (cards, menus, diálogos), pill (badges, switch).
- **Bordas:** 1px sempre. `--line-subtle` #1E1E22 para divisores internos, `--line` #26262B para cards e `--line-strong` #33333A para controles e overlays. Tracejado = desabilitado ou linha de total.
- **Sombras:** só duas. `--shadow-overlay` (0 12 32 /60%) e `--shadow-dialog` (0 24 48 /70%). Sem sombras internas nem glow.
- **Cards:** surface + borda line + raio 10, sem sombra. Título opcional em caption mono.
- **Hover:** clareia um degrau de superfície (raised → hover). Ghost ganha fundo raised e texto principal. O primário escurece (brightness .88). Linhas de tabela usam #141416.
- **Press:** sem encolhimento nem animação extra. O estado de hover já basta.
- **Foco:** borda acento + anel de 3px do acento a 25% (`--focus-ring`). Em erro, o anel é `--focus-ring-danger`.
- **Seleção:** linha de tabela selecionada = fundo raised + filete interno de 2px à esquerda em tinta. Aba ativa = sublinhado de 2px em tinta. Segmento ativo = fundo hover.
- **Desabilitado:** opacidade .35. Inputs desabilitados usam borda tracejada.
- **Carregamento:** Skeleton (pulso de 1,4s em `--surface-hover`) para áreas e Spinner (traço fino, 700ms) dentro de botões ou ações curtas. Os keyframes `ds-pulse` e `ds-spin` ficam em `tokens/base.css`.
- **Movimento:** mínimo. 150ms, `cubic-bezier(.2,0,0,1)`, só em cor, opacidade e posição do knob do switch. Sem bounce e sem entradas escalonadas.
- **Transparência e blur:** só o overlay de modal (rgba(5,5,6,.72)), sem blur.
- **Fundos e imagens:** fundo chapado. Sem gradientes, texturas ou ilustrações. Fotos, se houver, entram em avatares e miniaturas sem tratamento.
- **Layout:** app em três colunas (sidebar 240 · conteúdo fluido · detalhe 360), barra superior de 64px e linhas de 52px.

- **Tokens adicionados no ERP:** `--scrim` (fundo atrás do Sheet) · `--primary-fg-muted` (texto secundário sobre tinta) · `--fs-num` 24 e `--fs-num-lg` 30 (números em mono) · `--fs-meta` 12 (datas, telefones) · `--fs-icon` 20 (glifos × ›).
- **Papel:** prévias de recibo e PDF usam `--paper` #F4F2EC, `--paper-ink`, `--paper-ink-2`, `--paper-muted`, `--paper-rule` e `--paper-accent` (terracota). É o único lugar com fundo claro.
- **Referência:** `Dark System.dc.html` é a exploração original. Fica na raiz para continuar abrindo; não é um componente.

## ICONOGRAPHY
- A **sidebar usa ícones Lucide** (18px, opacidade .7 inativo e 1 ativo) para reconhecer cada módulo sem ler. Fora da sidebar, o sistema é text-first e as ações usam rótulo.
- Glifos embutidos nos componentes: check (Checkbox), chevron (Select), lupa (busca no kit). São SVGs de traço 1.5px com cantos arredondados.
- Glifos unicode aceitos: `+` `×` `···` `⌘` `⌫` `⧉`, sempre em IconButton com `label`.
- Biblioteca: **Lucide**, versão fixada em `lucide-static@0.400.0` (CDN), aplicada via `mask` + `currentColor`. Ícones dos módulos do ERP: sun (Hoje), shopping-cart (Vendas), banknote (Caixa), package (Pedidos), users (Clientes), tag (Produtos), truck (Compras), wallet (Financeiro), bar-chart-2 (Relatórios), settings, bot (Agentes), shopping-bag (Agente Shopee).
- Sem emoji. Sem ícones preenchidos ou coloridos.

## Marca
Nenhum logo foi fornecido. Onde iria a marca, use o nome em Geist 600 ("Dark System"). O "N" do kit é o avatar de um workspace fictício, não um logo.

## Fontes
Geist e Geist Mono vêm do Google Fonts via `@import` em `tokens/fonts.css`. Para uso offline, coloque os arquivos .woff2 em `assets/fonts/` e troque o import por `@font-face` local.

## Uso no Figma
1. Instale o plugin **Tokens Studio** → Load from file → `tokens/tokens.json` → "Create variables" e "Create styles".
2. Para trazer telas, exporte o kit como HTML único e importe com o plugin **html.to.design**.
