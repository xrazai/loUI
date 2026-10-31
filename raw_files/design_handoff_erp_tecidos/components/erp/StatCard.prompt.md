Cartão de indicador para o topo das telas (Hoje, Compras, Financeiro, Relatórios).
```jsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
  <StatCard label="Vendido" value="R$ 37.655,30" note="+12% vs 30 dias anteriores" noteTone="success" />
  <StatCard label="Vencido" value="R$ 96,40" tone="danger" note="Água desde 28 out" />
</div>
```
- No máximo 4 por linha. Grade com minmax(240px, 1fr) para não cortar valores grandes.
- A cor do número só muda quando há ação a tomar. Tudo em dia = success.
