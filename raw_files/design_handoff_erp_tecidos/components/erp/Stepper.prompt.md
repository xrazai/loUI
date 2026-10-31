Contador − / +. Setas ↑ ↓ também funcionam com foco no grupo.
```jsx
<Stepper label="Parcelas" value={n} onChange={setN} min={2} max={12} suffix="×" />
```
- Para quantidades de venda (podem ser grandes), use Input numérico, não Stepper.
