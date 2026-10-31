Indicador de vencimento com a regra única do ERP: < 0 dias = danger · hoje e até 7 dias = warning · depois = neutro.
```jsx
<DueIndicator date="2026-10-28" today="2026-10-30" />   // ● 28 out vencido há 2 dias
<DueIndicator date="2026-10-30" today="2026-10-30" />   // ● 30 out vence hoje
<DueIndicator date="2026-10-05" paid paidText="Paga em 05 out" showDate={false} />
```
- Use `dueInfo()` para contar badges (vencidos + hoje) e agrupar listas (Vencido · Próximos 7 dias · Mais adiante).
