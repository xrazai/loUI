Segmented control para filtrar uma lista ou alternar período; aceita contagem por opção.
```jsx
<SegmentedControl value={f} onChange={setF} options={[{ value: "all", label: "Todos", count: 128 }, { value: "open", label: "Abertos", count: 24 }]} />
```
- Use Tabs para trocar de vista; SegmentedControl para filtrar a mesma vista.
