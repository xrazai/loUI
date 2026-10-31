Painel lateral (direita) para cadastrar, ver e editar sem perder a lista de vista. Esc fecha.
```jsx
<Sheet open={!!sel} onClose={close} title="Pedido #1048" headerExtra={<Badge tone="accent">Novo</Badge>}
  footer={<><Button variant="danger">Excluir</Button><div style={{ marginLeft: "auto", display: "flex", gap: 8 }}><Button onClick={close}>Cancelar</Button><Button variant="primary">Salvar ↵</Button></div></>}>
  <Input label="Nome" autoFocus />
</Sheet>
```
- Use Sheet para formulários e detalhes; Dialog só para confirmações curtas.
- Larguras: 440 (cadastro), 460 (pedido), 480 (extrato com lista).
- Enter salva, Esc fecha. O toast desloca para não cobrir o painel.
