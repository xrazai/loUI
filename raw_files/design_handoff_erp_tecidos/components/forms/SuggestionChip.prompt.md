Sugestão que adiciona algo. Tracejado = "ainda não está aqui". Some depois de usada.
```jsx
<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
  {sugs.map((s) => <SuggestionChip key={s.label} onClick={() => insert(s.text)}>{s.label}</SuggestionChip>)}
</div>
```
- Não use para filtros (use SegmentedControl) nem para tags removíveis (use Tag).
