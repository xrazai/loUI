Etapas de status clicáveis. Concluída = success com ✓; atual = tinta (primary); futura = contorno.
```jsx
<StatusSteps steps={["Novo", "Separado", "Enviado", "Entregue"]} current={1} onSelect={(i) => setStatus(flow[i])} />
<StatusSteps steps={["Novo", "Separado", "Retirado"]} current={2} complete />
```
- Mudar de status mostra toast com Desfazer, nunca confirmação.
