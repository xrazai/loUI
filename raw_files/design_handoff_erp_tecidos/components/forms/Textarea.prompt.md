Texto longo: instruções, observações, resposta editável.
```jsx
<Textarea label="Resposta do agente" aside="Pode editar antes de enviar" value={draft} onChange={(e) => setDraft(e.target.value)} />
<Textarea label="Diretrizes" rows={11} aside="Salvo automaticamente" />
```
