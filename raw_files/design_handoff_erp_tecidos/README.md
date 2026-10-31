# Handoff: ERP para loja de tecidos (Dark System)

## Overview
ERP de uso diário para uma loja de tecidos com um único operador (o dono), pensado para **zero atrito e foco** (o dono tem TDAH): uma ação principal por tela, teclado primeiro, "Desfazer" em vez de confirmações, listas em ordem alfabética, linguagem direta em português (BR).

Módulos: **Hoje** (painel do dia) · **Vendas** (balcão) · **Pedidos** (WhatsApp, com PDF) · **Clientes** · **Catálogo** (Tecidos, Cores, Produtos) · **Compras** (fornecedores, parcelas) · **Financeiro** (Caixa do dia, A pagar, A receber) · **Relatórios** · **Agentes** (IA por área, com aprovação) · **Configurações** (Impressão, Inteligência artificial).

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML**: protótipos que mostram aparência e comportamento, **não código de produção para copiar**. A tarefa é **recriar estas telas no ambiente do projeto de destino** (React, Vue etc.) com seus padrões e bibliotecas. Se ainda não houver projeto, sugestão: **React + TypeScript + Vite**, estilos via as variáveis CSS de `tokens/`, e os componentes de `components/` (já escritos em React) como base da biblioteca de UI.

`ERP.dc.html` abre direto no navegador (precisa de `support.js` e `styles.css` ao lado). Toda a lógica está no bloco `<script type="text/x-dc">` (classe `Component`, método `renderVals()`), e o markup é inline-styled. Use-o como **especificação viva**: clique em tudo, e leia a lógica para regras de negócio.

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, estados e microcopy são finais. Recrie pixel a pixel usando os tokens. Dados são fictícios e **nada persiste ao recarregar** (intencional no protótipo).

---

## Layout global
- Min-width do app: **1180px**. Grid: `248px` (sidebar) + `minmax(0,1fr)` (conteúdo). Altura 100vh; cada área rola sozinha.
- **Sidebar** (`--bg`, borda direita `--line-subtle`, padding 16/12, gap 20): bloco da loja (avatar 28px "M" em `--primary-bg`, "Minha loja" 14/600 + data 12 `--text-3`); grupos **Rotina / Catálogo / Gestão** com título caption mono uppercase; itens 36px, ícone Lucide 18px (opacidade .7 inativo / 1 ativo), ativo = `--surface-raised` + barra `inset 2px 0 0 --text`. Contadores pílula 20px mono 12 com cor pelo motivo (Hoje neutro; Pedidos warning; Compras/Financeiro danger; Agentes accent). Rodapé: cartão de status do caixa (ponto verde "Caixa aberto · Desde 09:02 · R$ vendido"; cinza quando fechado; clica → Caixa) e item **Configurações**.
- **Topbar** 64px, padding 0 32, borda inferior `--line-subtle`: título 17/600 + subtítulo 14 `--text-3` à esquerda; à direita busca "Buscar ou executar… ⌘K" (240px, ainda sem função) e **ação primária** da tela com o atalho em mono (ex.: "Nova venda F2", "Novo pedido N").
- **Painéis laterais (Sheet)**: fixos à direita, largura 440 (cadastro) / 460 (pedido) / 480 (fornecedor), fundo `--surface`, borda `--line-strong`, `--shadow-dialog`, scrim `--scrim`. Header 64px (título + meta mono + ×), corpo com padding 24 e gap 18, rodapé fixo: destrutiva à esquerda, Cancelar + primária à direita.
- **Toast**: pílula centrada na **área livre** (desloca para não cobrir painel lateral/colunas de 360–480px), bottom 24, ponto verde + texto + botão "Desfazer" quando aplicável. Some em 3,6 s.
- **Diálogo de confirmação**: só para excluir cadastro/registro. 440px, título 17/600, corpo 14 `--text-2`, "Cancelar" com foco, ação `danger-solid`.

## Telas
### Hoje
Cabeçalho com frase-resumo ("Faltam N coisas hoje."), barra de progresso, 3 StatCards (Vendido hoje · A receber · A pagar hoje). Lista de tarefas ordenada por urgência (danger → warning → accent → neutro, depois horário) com checkbox, módulo, título, meta, chip de prazo e botão de ação. Concluir mostra toast com Desfazer; "Ocultar feitas".

### Vendas (F2)
Duas colunas: composer (`minmax(0,1fr)`) + resumo (420px).
- Fluxo por teclado: **Tecido** (combobox busca nome/código) → **Cor** (só cores vinculadas ao tecido) → **Preço** (vem do tecido ou do override do produto; editável) → **Quantidade** → Enter adiciona linha. **Sempre cria linha nova** (não agrega).
- Atalhos recentes (últimas 5 combinações). Linhas com bolinha da cor, "Tecido · Cor", `qtd × preço`, subtotal, × remover (toast Desfazer).
- Resumo: forma (Pix, Dinheiro, Débito, Crédito), "Recebido" e troco quando Dinheiro, total, **Finalizar F9**. Lista de vendas do dia abaixo; clicar abre Sheet da venda (editar, imprimir recibo, excluir com confirmação).
- Ao finalizar: conforme Configurações → *Perguntar* (diálogo com prévia do recibo térmico, Enter imprime / Esc pula), *Imprimir sempre*, *Não imprimir*.

### Pedidos
Lista (filtros segmentados Todos/Novos/Separados/Enviados/Concluídos com contagem) e **Novo pedido** (mesmo composer de Vendas + cliente com autocomplete/cadastro automático, telefone, Retirada/Entrega, endereço, frete). "Salvar e compartilhar" gera o **PDF (A4, jsPDF)** e abre o compartilhamento nativo (`navigator.share` com arquivo; sem suporte → baixa o PDF e abre `wa.me` com a mensagem).
Sheet do pedido: StatusSteps clicáveis (Novo → Separado → Enviado → Entregue; retirada pula Enviado e mostra "Retirado"); marcar **Entregue sem venda** abre diálogo "Como foi pago?" (ChoiceTiles 2×2) → cria a venda (inclui linha de Frete) ou "Ainda não foi pago". Botões: Excluir, Editar, Imprimir, Compartilhar, próxima etapa.

### Clientes
Tabela alfabética (sem nome por último): nome, WhatsApp, endereço, última compra, nº pedidos, total gasto (soma de **todos** os pedidos). Todos os campos opcionais. Sheet com dados + histórico de pedidos + "Novo pedido".

### Catálogo
- **Tecidos**: código (gerado das 3 letras do nome, único), nome, composição, preço de venda, fornecedor, amostras das cores vinculadas.
- **Cores**: amostra, nome, código, hex, em quais tecidos é usada.
- **Produtos** = vínculo tecido × cor. Duas vistas: **Grade** (MatrixGrid: célula 40px; ligada = preenchida com a cor + ✓; desligada = tracejado +; clique alterna com toast Desfazer) e **Por tecido** (lista com preço editável inline; override por produto).
- Preço mora no **tecido**; produto herda, mas pode sobrescrever.
- Excluir tecido/cor remove os produtos vinculados (confirmação informa quantos).

### Compras
3 StatCards (Você deve · Vence em 7 dias · Vencido). Tabela de fornecedores (tecidos que fornece — ligação pelo nome do campo Fornecedor do tecido —, última compra, próximo vencimento com DueIndicator, saldo). Sheet do fornecedor: saldo grande, "Registrar pagamento" / "Nova compra", **Em aberto** (parcelas com Pagar) e **Extrato** (LedgerList com saldo corrido).
Nova compra: valor, data, descrição, condição **À vista** (registra compra + pagamento), **Boleto** (1 vencimento), **Parcelado** (2–12×, mensal a partir do 1º vencimento; última parcela absorve o arredondamento) com prévia das parcelas.
**Pagamentos abatem as parcelas mais antigas primeiro** (alocação FIFO por vencimento).

### Financeiro (abas 1 · 2 · 3)
- **Caixa do dia** (coluna direita 360px): "Entrou hoje" + 4 cards por forma (valor, %, barra, nº vendas). Gaveta de dinheiro: troco inicial (editável), vendas em dinheiro, retiradas/reforços (excluir com Desfazer), pagamentos a fornecedor em dinheiro → **Deve ter na gaveta**. Fechamento: campos "contado" por forma (Dinheiro obrigatório; vazio = não conferido), mensagem por campo *Bateu / Sobrou R$ / Faltou R$*, diferença total, **Fechar caixa ↵** (Desfazer; marca a tarefa "Fechar o caixa" em Hoje). Fechado → resumo + Reabrir.
- **A pagar**: parcelas de compras + **contas fixas** (nome, valor, dia do mês; meses curtos vencem no último dia), agrupadas Vencido / Próximos 7 dias / Mais adiante. Pagar parcela abre o formulário de pagamento; pagar conta fixa é 1 clique com Desfazer. Lista de contas fixas com status do mês clicável (paga ↔ em aberto).
- **A receber**: pedidos **sem venda registrada**, agrupados por cliente (alfabético), "Cobrar no WhatsApp" (mensagem pronta) e "Receber" por pedido (escolhe forma → cria venda).

### Relatórios (períodos 1–4: Hoje, 7, 30, 90 dias)
KPIs com variação vs período anterior (Hoje compara com a mesma sexta da semana passada): Vendido, Vendas, Ticket médio, Quantidade vendida. Gráfico de barras (por hora / dia / semana) com hoje em `--text` e melhor barra em `--text-2`, tooltip nativo, média. Formas de pagamento (ProportionBar + legenda). Rankings (top 6, por Valor ou Quantidade): Principais clientes (clica → cadastro), Tecidos, Cores. **Produtos parados**: sem venda há ≥30 dias ou nunca vendidos (≥60 dias em warning, nunca em danger), com "Tirar do catálogo".
O protótipo usa **180 dias de histórico sintético** (gerador determinístico `HIST`) + as vendas reais da sessão.

### Agentes
Grade (`auto-fill minmax(320px,1fr)`) com AgentCard por agente + cartão tracejado **Novo agente** (N).
- **Agente Shopee** (simulado): abas *Para aprovar* (ApprovalCard: tipo, estrelas, usuário, produto, mensagem, **resposta editável**, aviso para avaliações ≤3★, Descartar / Enviar resposta com Desfazer), *Enviadas*, *Instruções* (diretrizes em texto + sugestões, autonomia por tarefa, modelo). Interruptor Ativo/Pausado. Chat lateral 360px (ChatPanel).
- **Novo agente** — assistente de 9 passos (um por tela, barra de progresso, Continuar ↵ / Voltar / Cancelar Esc): 1 Descrever (frase livre + exemplos; **exige OpenRouter conectado**) → 2 Perguntas (IA gera 2–3 perguntas com opções) → IA monta rascunho JSON → 3 Nome, área, descrição, ícone → 4 Tarefas → 5 Diretrizes → 6 Autonomia por tarefa (enviar ao cliente ou mexer em dinheiro começa em "Pedir aprovação") → 7 Dados que consulta (Catálogo, Pedidos, Clientes, Vendas, Financeiro, Compras) → 8 Modelo (lista OpenRouter com busca) → 9 Teste no chat → **Criar agente**. Falhas da IA têm fallback (perguntas padrão / preencher à mão).
- Agente criado nasce **Em teste** (só conversa). "Ativar agente" no topo (Desfazer); depois interruptor Ativo/Pausado. Tudo editável; Excluir com confirmação.
- Prompt de sistema dos agentes: ver `agentSystem()` e `dataFor()` no script (injeta tarefas, diretrizes e um snapshot dos dados marcados).

### Configurações
Grade de categorias → tela da categoria com "‹ Configurações" (Esc).
- **Impressão**: Recibo (impressora, papel 80/58mm, vias 1–3, ao finalizar: Perguntar/Imprimir sempre/Não imprimir, Imprimir teste) e Pedidos (impressora, papel A4/80mm, vias, teste).
- **Inteligência artificial**: chave OpenRouter (mascarada, Mostrar/Ocultar, Conectar → valida em `GET /api/v1/auth/key` e carrega `GET /api/v1/models`), "Lembrar neste computador" (localStorage `erp.openrouter.key`), modelo padrão (busca, top 6, preço por 1M tokens entrada · saída, contexto), Remover chave (Desfazer).

---

## Interactions & Behavior
- **Teclado**: F2 nova venda (qualquer tela) · F9 finalizar venda / salvar pedido · N novo item da tela · Enter confirma/salva · Esc fecha/volta · 1–4 abas ou períodos · Tab/Espaço/Enter em todo elemento clicável · ↑↓ nas listas de combobox.
- **Foco visível**: anel `--focus-ring` em botões/campos; contorno 2px `--accent` (offset −2px) em linhas, abas e cartões (`[role][tabindex]:focus-visible`).
- **Desfazer vs confirmar**: Desfazer para status, pagamentos, envio, remoção de linha, vínculos, pausar/ativar. Confirmação só para excluir tecido, cor, cliente, fornecedor, venda, pedido, lançamento, conta fixa, agente.
- **Transições**: `--duration` 150ms, `--ease` cubic-bezier(.2,0,0,1); feedback de conclusão 320ms. Spinner `ds-spin` 700ms linear.
- **Validação** inline abaixo do campo em `--danger` (ex.: "Escolha o fornecedor.", "Informe o valor.", "Use um dia de 1 a 31."); só aparece após tentar salvar.
- **Moeda**: valores em **centavos inteiros**; digitação só dígitos; exibição `pt-BR` BRL. Telefone formatado `(11) 90000-0000`.

## State / Data model (sugestão para o backend)
```ts
Tecido { id, nome, codigo, composicao, preco /*centavos*/, fornecedor }
Cor { id, nome, codigo, hex }
Produto { id, tecidoId, corId, preco: number | null /*override*/ }
Venda { num, data, hora, pagamento: 'Pix'|'Dinheiro'|'Débito'|'Crédito', recebido, total, pecas,
        lines: { nome, hex, preco, qtd, tecId?, corId?, frete? }[], pedido?: number }
Cliente { id, nome?, tel?, endereco?, obs? }
Pedido { id, cli?, tel?, modo: 'entrega'|'retirada', endereco?, frete, status: 'novo'|'separado'|'enviado'|'entregue',
         quando, venda?: number, pagamento?, lines: { nome, hex, preco, qtd }[] }
Fornecedor { id, nome, tel?, obs? }
Compra { id, fornId, data, desc?, total, parcelas: { venc, valor }[] }
Pagamento { id, fornId, data, valor, forma: 'Pix'|'Boleto'|'Transferência'|'Dinheiro' }
ContaFixa { id, nome, valor, dia }       ContaPaga { id, contaId, mes /*AAAA-MM*/, data, valor, forma }
Caixa { abertura, troco, movs: { id, tipo: 'sangria'|'suprimento', valor, desc, hora }[],
        contado: Record<forma, number|null>, fechado?: { hora, esp, contado, diff } }
AgenteShopeeItem { id, tipo: 'pergunta'|'avaliacao', estrelas?, quem, quando, produto, hex, msg, draft,
                   status: 'pendente'|'enviada'|'descartada', enviadaAs? }
Agente { id, nome, area, icone, descricao, tarefas: { id, nome, auto: 'aprovar'|'sozinho' }[], instr,
         fontes: ('catalogo'|'pedidos'|'clientes'|'vendas'|'financeiro'|'compras')[], model, status: 'teste'|'ativo'|'pausado',
         chat: { role, content }[] }
Config { recibo: { printer, papel: '80mm'|'58mm', vias, modo: 'perguntar'|'sempre'|'nunca' },
         pedido: { printer, papel: 'A4'|'80mm', vias }, openrouter: { model } }
```
Regras-chave: preço efetivo = `produto.preco ?? tecido.preco` · saldo fornecedor = Σcompras − Σpagamentos · gaveta = troco + vendas em dinheiro + reforços − retiradas − pagamentos em dinheiro do dia · vencimento: <0 dias danger, 0–7 warning, >7 neutro · A receber = pedidos sem `venda`.

## O que é simulado e precisa de backend
1. **Persistência** de tudo (hoje some ao recarregar).
2. **OpenRouter**: a chave fica no navegador. Em produção, guardar no servidor e **proxy** das chamadas `chat/completions`.
3. **Shopee**: itens do agente são fictícios. Integrar Shopee Open Platform (perguntas, avaliações, envio de respostas após aprovação).
4. **Impressoras**: o navegador não lista impressoras; hoje imprime via `window.print()` num iframe com `@page` do papel. Para impressão direta, usar um conector local (ex.: QZ Tray) e listar as impressoras reais.
5. **WhatsApp**: compartilhamento via Web Share API (arquivo) com fallback `wa.me`. Automação real (agente) exige WhatsApp Business API.
6. **Agentes**: tarefas ainda não executam sozinhas; só o chat funciona.

## Design Tokens
Fonte única: `tokens/*.css` (entrada `styles.css`) e `tokens/tokens.json` (Tokens Studio/Figma).
- **Neutros**: `#050506` canvas · `#0B0B0C` bg · `#111113` surface · `#18181B` raised · `#1F1F23` hover · `#141416` row-hover · linhas `#1E1E22` subtle / `#26262B` / `#33333A` strong · texto `#EDEDEA` / `#A3A3A9` / `#7A7A82` · inverso `#0B0B0C`.
- **Sinais**: accent `#8AB4FF` · success `#5FD49A` · warning `#E9B65C` · danger `#F07A6E`; versões *soft* = 14% (danger 10%).
- **Ação**: primary-bg `#EDEDEA`, primary-fg `#0B0B0C`, primary-fg-muted `#5A5A60`. Overlay `rgba(5,5,6,.72)`, scrim `rgba(5,5,6,.55)`, focus-ring `0 0 0 3px accent 25%`.
- **Papel** (recibo/PDF): `#F4F2EC`, tinta `#151515` / `#3A3A3A`, muted `#6B6B6B`, régua `#9A968C`, acento `#B8603E`.
- **Tipo**: Geist (400/500/600) e Geist Mono (400/500). Escala: display 34/40 · title 22/30 · heading 17/24 · body 15/24 · small 14/22 · label 13/18 · meta 12/16 · caption 11.5/16 mono uppercase +8% · num 24/32 mono · num-lg 30/36 mono · icon 20.
- **Espaço** (grade 4): 4 8 12 16 20 24 32 48 64. Padding de card 20; gaps 8–16 dentro, 24–32 entre seções.
- **Controles**: 32 / 40 (padrão) / 48 · item 36 · linha 52 (listas densas 60) · topbar 64.
- **Raios**: 4 (chips, itens), 6 (botões, inputs), 10 (cards, diálogos), pill.
- **Sombras** só em overlays: `0 12px 32px rgba(0,0,0,.6)` (menus/toast), `0 24px 48px rgba(0,0,0,.7)` (diálogo/painel).

## Assets
- Ícones: **Lucide** `lucide-static@0.400.0` via CSS mask + `currentColor`. Usados: sun, shopping-cart, message-circle, users, layers, palette, tag, truck, wallet, bar-chart-2, bot, settings, shopping-bag, printer, sparkles, package, bell.
- Fontes: Geist e Geist Mono (Google Fonts, `tokens/fonts.css`).
- PDF: jsPDF 2.5.1 (CDN). Sem imagens de produto; cores são amostras hex.

## Files
- `ERP.dc.html` — protótipo completo (abrir no navegador com `support.js` e `styles.css` ao lado).
- `styles.css`, `tokens/` — tokens (CSS + `tokens.json`).
- `components/` — biblioteca React do Dark System (`.jsx` + `.d.ts` com props + `.prompt.md` com uso). Grupos: forms, inputs, data, display, feedback, layout, navigation, **erp** (Sheet, StatCard, Swatch, ColorOption, StatusSteps, Stepper, DueIndicator, ChoiceTiles, ProportionBar, RankList, MatrixGrid, LedgerList), **agents** (AgentCard, ApprovalCard, ChatPanel).
- `guidelines/` — cartões de fundação (cores, tipo, espaço, estados, princípios, Teclado e Desfazer).
- `ui_kits/erp/README.md` — mapa tela → componentes.
- `design-system-readme.md` — regras completas do design system (conteúdo, visual, iconografia).

## Ordem sugerida de implementação
1. Tokens + componentes base → 2. Shell (sidebar, topbar, toast, Sheet, Dialog, atalhos) → 3. Catálogo → 4. Vendas → 5. Clientes + Pedidos (PDF/compartilhar) → 6. Compras → 7. Financeiro → 8. Hoje → 9. Relatórios → 10. Configurações → 11. Agentes (OpenRouter via backend) → 12. Integrações (Shopee, impressão direta, WhatsApp).
