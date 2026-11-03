import { useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  CurrencyInput,
  Inline,
  Stack,
  Text,
  formatCurrency,
  useDSLocale,
} from '../../index';

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
