Matriz de vínculo. Ligada = célula preenchida com a cor e ✓; desligada = tracejado com +. Rola na horizontal quando há muitas colunas.
```jsx
<MatrixGrid corner="Tecido" rows={tecidos.map((t) => ({ id: t.id, label: t.nome, meta: `${t.codigo} · ${brl(t.preco)}` }))}
  cols={cores.map((c) => ({ id: c.id, label: c.nome, hex: c.hex }))} isOn={linked} onToggle={toggle} countLabel="Cores"
  hint="Clique numa célula para vincular ou desvincular. Cada vínculo vira um produto vendável com o preço do tecido." />
```
- Ligar e desligar mostram toast com Desfazer.
