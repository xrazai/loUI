Campo de texto de 32px com rótulo acima, ajuda/erro abaixo e anel de foco no acento.
```jsx
<Input label="Nome do workspace" placeholder="ex.: Northwind" hint="Visível para todo o time." />
<Input label="E-mail" value={v} onChange={e => setV(e.target.value)} error="Digite um e-mail completo." />
<Input placeholder="Buscar pedidos" leading={<SearchIcon />} trailing={<Kbd>/</Kbd>} />
```
- Desabilitado: borda tracejada, fundo surface.
