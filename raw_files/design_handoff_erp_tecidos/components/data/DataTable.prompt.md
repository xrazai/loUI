Tabela de dados em grid: cabeçalho caption mono clicável para ordenar (asc → desc → sem), checkbox por linha, barra de ações em massa e paginação automática.
```jsx
<DataTable selectable pageSize={8} rows={orders} activeKey={sel} onRowClick={(r) => setSel(r.id)}
  columns={[{ key: "id", label: "Pedido", width: "80px", mono: true, muted: true },
            { key: "customer", label: "Cliente" },
            { key: "status", label: "Status", width: "100px", render: (r) => <Badge tone="success">{r.status}</Badge> },
            { key: "total", label: "Total", width: "110px", align: "right", mono: true, render: (r) => money(r.total) }]}
  bulkActions={(keys, clear) => <Button size="sm" onClick={() => { archive(keys); clear(); }}>Arquivar</Button>} />
```
