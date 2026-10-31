Coluna fixa de 360px à direita da tela do agente (borda esquerda line-subtle).
```jsx
<ChatPanel intro="Teste respostas ou peça ajustes. Ele segue as diretrizes e o catálogo atual."
  prompts={["Como você responderia: “tem tricoline mostarda?”"]} messages={msgs} busy={busy} onSend={ask} onClear={() => setMsgs([])} />
```
- Mensagem sua: fundo hover, à direita. Do agente: fundo bg com borda, à esquerda. Erro: borda e texto danger.
- O agente nunca envia nada ao cliente pelo chat. Tudo que sai passa pela fila de aprovação.
