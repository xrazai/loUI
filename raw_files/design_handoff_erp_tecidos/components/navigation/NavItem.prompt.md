Item de sidebar de 36px com ícone Lucide, rótulo e contador colorido pelo motivo; ativo = fundo raised + filete de 2px em tinta.
```jsx
<NavItem icon="sun" label="Hoje" count={6} active />
<NavItem icon="package" label="Pedidos" count={3} tone="warning" />
<NavItem icon="wallet" label="Financeiro" count={1} tone="danger" />
```
- Contador só quando há ação pendente. Nunca mostre totais ("128 produtos") na sidebar.
