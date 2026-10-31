Cabeçalho de página do app (56px, borda inferior sutil).
```jsx
<TopBar title="Pedidos" actions={<><SearchInput value={q} onChange={setQ} /><Button variant="primary">Novo pedido</Button></>} />
<TopBar breadcrumb={[{ label: "Pedidos", onClick: back }, { label: "PED-1048" }]} />
```
