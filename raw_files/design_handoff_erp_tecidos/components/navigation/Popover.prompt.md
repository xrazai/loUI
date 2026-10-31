Popover genérico (base de menus, filtros, mini-formulários). Raised + sombra de overlay.
```jsx
<Popover trigger={<Button>Filtros</Button>} width={240}>
  {(close) => <div style={{ padding: 12 }}>…<Button size="sm" onClick={close}>Aplicar</Button></div>}
</Popover>
<Popover align="end" trigger={<IconButton label="Ações" variant="ghost">···</IconButton>}>{(close) => <Menu items={…} onClose={close} />}</Popover>
```
