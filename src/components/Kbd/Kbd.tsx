import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { isMacPlatform } from '../../hooks/hotkey';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Kbd.module.css';
import { messages } from './Kbd.messages';
import { resolveKey } from './keys';

export type KbdPlatform = 'apple' | 'other';

interface KbdBaseProps extends Omit<ComponentPropsWithRef<'kbd'>, 'children'> {
  /**
   * Forces the platform used to render `Mod` and the modifier symbols. By default it is
   * detected in the browser; during server rendering and the first client render it is
   * `other` (Ctrl), then switches to `apple` (the command symbol) after hydration.
   */
  platform?: KbdPlatform;
  /** Per-instance overrides of the spoken key names and short key labels. */
  messages?: Partial<typeof messages.en>;
}

interface KbdKeysProps extends KbdBaseProps {
  /**
   * The keys of one shortcut, in order: `['Mod', 'K']`, `['Shift', 'Enter']`, `['Esc']`.
   * Recognized names (case-insensitive): `Mod` (Command on Apple, Control elsewhere), `Cmd`,
   * `Meta`, `Ctrl`, `Shift`, `Alt`, `Option`, `Enter`, `Esc`, `Tab`, `Backspace`, `Delete`,
   * `Space`, arrows (`Up`, `ArrowUp`, ...), `Home`, `End`, `PageUp`, `PageDown`. Anything
   * else is shown as typed (`K`, `/`, `1`). Symbols are hidden from assistive technology and
   * replaced by the spoken name.
   */
  keys: readonly string[];
  children?: never;
}

interface KbdChildrenProps extends KbdBaseProps {
  /** Free content shown as is (for example `⌘K`). Prefer `keys`, which is accessible and platform-aware. */
  children: ReactNode;
  keys?: never;
}

export type KbdProps = KbdKeysProps | KbdChildrenProps;

/**
 * Provided by controls that name themselves from their content (Button). A `Kbd` inside one is
 * hidden from assistive technology so the shortcut is not read as part of the name; the control
 * exposes it through `aria-keyshortcuts` instead.
 */
export const KbdInsideControlContext = createContext(false);

const subscribe = () => () => undefined;

/** Apple platforms after hydration; `false` on the server and for the first client render. */
export function useIsApplePlatform(override: KbdPlatform | undefined): boolean {
  const detected = useSyncExternalStore(subscribe, isMacPlatform, () => false);
  return override === undefined ? detected : override === 'apple';
}

/**
 * A keyboard shortcut hint in mono type. With `keys` it renders `Mod` as the command symbol
 * on Apple platforms and as Ctrl elsewhere, and gives screen readers the spoken key names.
 */
export function Kbd({
  keys,
  children,
  platform,
  messages: overrides,
  className,
  ...rest
}: KbdProps) {
  const locale = useDSLocale();
  const t = useMessages('Kbd', messages, overrides);
  const apple = useIsApplePlatform(platform);
  const insideControl = useContext(KbdInsideControlContext);
  const classes = classNames(styles.root, className);
  const hidden = insideControl ? { 'aria-hidden': true as const } : undefined;

  if (keys === undefined) {
    return (
      <kbd {...hidden} {...rest} className={classes}>
        {children}
      </kbd>
    );
  }

  const parts = keys.map((raw, index) => {
    const key = resolveKey(raw, apple);
    if (key.kind === 'literal') {
      return (
        <kbd key={index} className={styles.key}>
          {key.text.length === 1 ? key.text.toLocaleUpperCase(locale) : key.text}
        </kbd>
      );
    }
    const name = t.name(key.id);
    const visible = key.glyph ?? t.label(key.id);
    return (
      <kbd key={index} className={styles.key}>
        <span aria-hidden={visible === name ? undefined : 'true'}>{visible}</span>
        {visible === name ? null : <VisuallyHidden>{name}</VisuallyHidden>}
      </kbd>
    );
  });

  return (
    <kbd {...hidden} {...rest} className={classes}>
      {parts}
    </kbd>
  );
}
