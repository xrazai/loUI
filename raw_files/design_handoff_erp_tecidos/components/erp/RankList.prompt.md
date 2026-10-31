Ranking dentro de um Card (sem padding no corpo). Linha 1: posição, nome, valor. Linha 2: barra e detalhe.
```jsx
<RankList format={brl} items={cores.map((c) => ({ id: c.id, label: c.nome, swatch: c.hex, value: c.total, meta: `${c.qtd} un. · ${c.pct}%` }))} />
```
- Use para tecidos, cores e clientes. Clientes recebem onClick (abre o cadastro).
