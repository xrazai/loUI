Opção de cor em grade de 2 colunas. Seleção = acento (é seleção, não ação).
```jsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
  {cores.map((c) => <ColorOption key={c.id} hex={c.hex} label={c.nome} selected={sel.includes(c.id)} disabled={linked(c.id)} mark={linked(c.id) ? "já vinculada" : undefined} onClick={() => toggle(c.id)} />)}
</div>
```
