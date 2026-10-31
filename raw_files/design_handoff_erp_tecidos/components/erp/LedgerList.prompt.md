Extrato com saldo corrido, dentro de Sheet (padded={false}) ou Card.
```jsx
<LedgerList format={brl} onDelete={askDelete} entries={[
  { id: "pg1", date: "15 out", title: "Pagamento", sub: "Boleto", delta: -128000, balance: 256000 },
  { id: "cp1", date: "30 set", title: "Linho natural e viscose", sub: "3× de R$ 1.280,00", delta: 384000, balance: 384000 },
]} />
```
