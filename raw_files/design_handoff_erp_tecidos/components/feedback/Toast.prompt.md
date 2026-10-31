Toast flutuante com ponto de status e ação opcional ("Desfazer").
```jsx
<Toast>Pedido #1051 criado</Toast>
<Toast tone="neutral" actionLabel="Desfazer" onAction={undo} onClose={hide}>3 itens arquivados</Toast>
```
