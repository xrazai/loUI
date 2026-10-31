Sidebar de 248px aprovada no ERP: seções Rotina · Comercial · Gestão com ícones Lucide, contadores coloridos pelo motivo e cartão de status no rodapé.
```jsx
<Sidebar workspace={{ name: "Minha loja", subtitle: "Sexta, 30 out" }} value={page} onChange={setPage}
  status={{ title: "Caixa aberto", meta: "Desde 09:02", value: "R$ 2.340,00" }}
  footer={<NavItem icon="settings" label="Configurações" />}
  sections={[
    { title: "Rotina", items: [{ value: "hoje", label: "Hoje", icon: "sun", count: 6 }, { value: "vendas", label: "Vendas", icon: "shopping-cart" }, { value: "caixa", label: "Caixa", icon: "banknote" }] },
    { title: "Comercial", items: [{ value: "pedidos", label: "Pedidos", icon: "package", count: 3, tone: "warning" }, { value: "clientes", label: "Clientes", icon: "users" }, { value: "produtos", label: "Produtos", icon: "tag" }] },
    { title: "Gestão", items: [{ value: "compras", label: "Compras", icon: "truck", count: 1, tone: "warning" }, { value: "financeiro", label: "Financeiro", icon: "wallet", count: 1, tone: "danger" }, { value: "relatorios", label: "Relatórios", icon: "bar-chart-2" }] }
  ]} />
```
- Mesma ordem e posição em todos os módulos. Contador só para pendências, nunca totais.
