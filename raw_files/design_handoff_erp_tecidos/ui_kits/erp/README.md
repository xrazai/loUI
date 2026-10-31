# UI kit — ERP (loja de tecidos)

App completo e clicável em `ERP.dc.html` (raiz do projeto). `index.html` aqui só abre o ERP dentro do design system. Dados fictícios, sem persistência ao recarregar.

## Módulos
Rotina: Hoje, Vendas (F2), Pedidos, Clientes · Catálogo: Tecidos, Cores, Produtos (grade e lista) · Gestão: Compras, Financeiro (Caixa, A pagar, A receber), Relatórios, Agentes · Configurações (Impressão, Inteligência artificial).

## Tela → componentes
| Tela | Componentes |
|---|---|
| Barra lateral | Sidebar, NavItem (status do caixa no rodapé) |
| Hoje | StatCard, ActionList, Badge, Toast |
| Vendas / Novo pedido | Combobox, CurrencyInput, Input, SegmentedControl, Kbd, Dialog (recibo), Sheet (venda) |
| Pedidos | DataTable, Badge, Sheet, StatusSteps, ChoiceTiles (pagamento na entrega), Dialog (compartilhar PDF) |
| Clientes / Compras | DataTable, Sheet, LedgerList, DueIndicator, Stepper (parcelas), DatePicker |
| Catálogo | DataTable, MatrixGrid, Swatch, ColorOption, Sheet |
| Financeiro | Tabs, StatCard + ProportionBar, DueIndicator, Input, EmptyState |
| Relatórios | SegmentedControl, StatCard, Chart (highlight), ProportionBar, RankList |
| Agentes | AgentCard, ApprovalCard, ChatPanel, Textarea, SuggestionChip, Rating, Switch, Alert |
| Novo agente | Progress, Textarea, Input, SuggestionChip, SegmentedControl, Checkbox, lista de modelos |
| Configurações | Card (categorias), Select, SegmentedControl, Stepper, Input, Checkbox |

## Regras que o ERP segue
- Ordem alfabética nas listas de cadastro; rankings por valor.
- Teclado: F2 nova venda · F9 finalizar · N novo item · Enter confirma · Esc volta · 1–4 abas · Tab/Espaço em tudo.
- Desfazer para quase tudo; confirmação só para excluir cadastro ou registro.
- Toast no centro da área livre, nunca cobrindo painel ou ação.
- Agentes: aprovar antes de enviar ao cliente ou mexer em dinheiro; novos agentes nascem "Em teste".

## Limites atuais
O ERP repete o visual dos componentes em estilos inline (não importa o código de `components/`). Ao levar para produção, troque cada bloco pelo componente da tabela acima.
