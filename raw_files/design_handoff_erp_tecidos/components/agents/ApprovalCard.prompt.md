Fila de aprovação dos agentes. Enviar e Descartar mostram toast com Desfazer, sem confirmação.
```jsx
<ApprovalCard kind="review" rating={2} author="compradora_sp" product="Malha · Preto" swatch="#1B1B1D" when="hoje · 10:40"
  message="A malha veio com um pequeno defeito na ponta." draft={d} onDraftChange={setD}
  flag="Avaliação de 2 estrelas: revise com calma antes de enviar." onSend={send} onDiscard={discard} />
```
- Avaliações de 1 a 3 estrelas sempre levam `flag`.
- Os botões são secundários: a tela tem vários cartões e só uma ação primária.
