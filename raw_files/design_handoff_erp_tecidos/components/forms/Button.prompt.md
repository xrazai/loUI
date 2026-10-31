Botão de ação em três tamanhos; use `primary` para a única ação principal da tela.
```jsx
<Button variant="primary" onClick={save}>Salvar</Button>
<Button>Cancelar</Button>
<Button variant="ghost" size="sm">Ver todos</Button>
<Button variant="danger">Excluir</Button>
<Button trailing={<Kbd>⌘K</Kbd>}>Buscar</Button>
```
- variants: primary · secondary (padrão) · ghost · danger · danger-solid (confirmação em diálogo)
- sizes: sm 28 · md 32 · lg 40
- Rótulos são verbos curtos em caixa de frase: "Criar pedido", não "CRIAR".
