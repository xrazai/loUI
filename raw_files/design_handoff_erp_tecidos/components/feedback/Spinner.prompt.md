Spinner de traço fino que herda a cor do texto; dentro de botões, use size 14.
```jsx
<Spinner />
<Spinner label="Salvando…" />
<Button variant="primary" disabled leading={<Spinner size={14} />}>Salvando</Button>
```
- Para áreas grandes, prefira Skeleton.
