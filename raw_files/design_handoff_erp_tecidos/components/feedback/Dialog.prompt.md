Diálogo modal (raised, raio lg, sombra de diálogo); Esc e clique fora fecham.
```jsx
<Dialog open={open} onClose={close} title="Excluir projeto?" description="Isso não pode ser desfeito."
  footer={<><Button onClick={close}>Cancelar</Button><Button variant="danger-solid" onClick={del}>Excluir</Button></>} />
```
- Ação destrutiva: `danger-solid`. Ação normal: `primary`.
