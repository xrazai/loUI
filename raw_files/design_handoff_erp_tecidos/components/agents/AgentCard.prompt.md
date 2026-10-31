Grade de agentes: `repeat(auto-fill, minmax(320px, 1fr))`, gap 16.
```jsx
<AgentCard name="Agente Shopee" area="Marketplace" icon="shopping-bag" status="active" pending={4}
  description="Responde perguntas de compradores e avaliações da loja. Você aprova antes de enviar." last="Última resposta enviada às 08:40" onOpen={open} />
<AgentCard name="Agente WhatsApp" area="Atendimento" icon="message-circle" status="soon" description="Vai montar rascunho de pedido pela conversa." />
```
- O número em acento é o único pedido de atenção do cartão. Não adicione métricas decorativas.
