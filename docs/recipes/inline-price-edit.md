# InlinePriceEdit

Status: experimental

A price that reads as text and turns into a field when pressed. Enter confirms, Esc cancels and restores the old value, leaving the field confirms. An empty field means "use the inherited price", which the placeholder shows.

Components: `Button`, `CurrencyInput`, `Text`, `Inline`, `Stack`.

## When to use

- Prices, quantities of money or any single value edited in a table cell or a list row, where a form or a sheet would be heavy.
- A value that can fall back to an inherited one (a variant price that follows its product).

## When not to use

- Several fields that belong together: use a form. See `form-with-validation` or `sheet-form`.
- A value whose change needs a confirmation (it reaches a customer or moves money): use an approval step. See `approval-queue`.

## What it does

1. **Press** the price (or `Enter` / `Space` on it) to open the field. It takes focus with the current value; the digits-only typing model of `CurrencyInput` applies ("1800" gives $18.00).
2. **Enter** confirms. **Esc** cancels: the old value stays, nothing is saved, and the key does not close a surrounding dialog or sheet (`stopPropagation`).
3. **Blur** confirms (clicking or tabbing elsewhere). Focus stays where the user moved it. After Enter or Esc, focus returns to the price button.
4. **Empty** (select all, then `Delete`) means "no price of its own". The placeholder shows the inherited price while the field is empty, even focused, until the first digit is typed.
5. A polite `role="status"` region says "Price saved: $18.00". It is always in the DOM so the change is announced. Nothing is saved when the value did not change.

## Things to keep when you adapt it

- Guard against saving twice: Enter unmounts the field, which can also fire a blur. The recipe settles once per edit with a ref.
- Give the price button a full name ("Edit price of Linen, white: $12.50"); it starts with the visible text, so voice control still works.
- `0` is a value, not empty. If `0` should mean "inherit" in your product, say so in the handler (`draft || null` here).
- Save errors: show an `Alert` or error toast and restore the old price. Reversible edits may also use `useUndoable` instead of the status line; see `undoable-action`.

## Code

<!-- recipe-source:start -->

```tsx
import { useLayoutEffect, useRef, useState } from 'react';
import { Button, CurrencyInput, formatCurrency, Inline, Stack, Text, useDSLocale } from 'loui-ds';

export interface InlinePriceEditProps {
  /** What is priced, used in the accessible names: "Linen, white". */
  name?: string;
  /** The product's own price in minor units, or `null` to inherit `inheritedPrice`. */
  initialPrice?: number | null;
  /** The price used while the product has none of its own, in minor units. */
  inheritedPrice?: number;
  currency?: string;
  /** Called with the confirmed price (`null` means "inherit"). Not called on cancel. */
  onSave?: (price: number | null) => void;
}

/**
 * A price that reads as text and edits in place. Press (or Enter on) the price to edit it:
 * Enter confirms, Esc cancels and restores the old value, and leaving the field confirms. An
 * empty field means "use the inherited price", which the placeholder shows while it is empty.
 */
export function InlinePriceEdit({
  name = 'Linen, white',
  initialPrice = null,
  inheritedPrice = 4990,
  currency = 'USD',
  onSave,
}: InlinePriceEditProps) {
  const locale = useDSLocale();
  const [price, setPrice] = useState<number | null>(initialPrice);
  const [draft, setDraft] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState('');
  const settled = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);
  const money = (minor: number) => formatCurrency(minor, currency, locale);

  // The field unmounts when editing ends, so focus goes back to the trigger by hand. After a
  // blur it stays where the user moved it.
  useLayoutEffect(() => {
    if (!editing && restoreFocus.current) {
      restoreFocus.current = false;
      trigger.current?.focus();
    }
  }, [editing]);

  // Focus the field when it opens (the autoFocus attribute is avoided on purpose).
  useLayoutEffect(() => {
    if (editing) field.current?.focus();
  }, [editing]);

  function start() {
    settled.current = false;
    setSaved('');
    setDraft(price);
    setEditing(true);
  }

  function finish(commit: boolean, returnFocus: boolean) {
    if (settled.current) return; // Enter and the blur it causes must not save twice.
    settled.current = true;
    restoreFocus.current = returnFocus;
    setEditing(false);
    // 0 and empty both mean "no price of its own".
    const next = commit ? draft || null : price;
    if (commit && next !== price) {
      setPrice(next);
      onSave?.(next);
      setSaved(`Price saved: ${money(next ?? inheritedPrice)}`);
    }
  }

  return (
    <Stack gap={2}>
      <Inline gap={3} align="center">
        <Text>{name}</Text>
        {editing ? (
          <CurrencyInput
            size="sm"
            aria-label={`Price of ${name}`}
            currency={currency}
            inputRef={field}
            placeholder={money(inheritedPrice)}
            description="Leave empty to use the inherited price."
            value={draft}
            onChange={setDraft}
            onBlur={() => {
              finish(true, false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                finish(true, true);
              } else if (event.key === 'Escape') {
                // Stop here so a surrounding dialog or sheet does not close with it.
                event.preventDefault();
                event.stopPropagation();
                finish(false, true);
              }
            }}
          />
        ) : (
          <Button
            ref={trigger}
            size="sm"
            variant="ghost"
            aria-label={`Edit price of ${name}: ${money(price ?? inheritedPrice)}`}
            onPress={start}
          >
            {money(price ?? inheritedPrice)}
          </Button>
        )}
      </Inline>
      <Text role="status" size="small" tone="secondary">
        {saved}
      </Text>
    </Stack>
  );
}
```

<!-- recipe-source:end -->
