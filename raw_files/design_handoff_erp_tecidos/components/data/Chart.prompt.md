Gráfico mínimo: barras cinza (a barra em hover vira acento) ou linha em acento com área a 8%. Grade tracejada e eixos em mono.
```jsx
<Chart type="bar" data={[{ label: "Seg", value: 42 }, { label: "Ter", value: 58 }]} />
<Chart type="line" height={160} data={vendas} format={(v) => "R$ " + (v / 1000) + "k"} />
```
- Uma série por gráfico. Para comparar séries, use dois gráficos lado a lado.
