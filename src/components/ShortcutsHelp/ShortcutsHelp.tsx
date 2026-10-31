import { useMemo } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useHotkeys, useRegisteredHotkeys } from '../../hooks/useHotkeys';
import type { RegisteredHotkey } from '../../hooks/hotkeyRegistry';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { compareText } from '../../utils/text';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { Kbd } from '../Kbd';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './ShortcutsHelp.messages';
import styles from './ShortcutsHelp.module.css';

export type ShortcutsHelpMessages = Partial<typeof messages.en>;

export interface ShortcutsHelpProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the dialog opens (from the hotkey) or closes. */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  /**
   * The shortcut that opens the dialog, registered in the hotkey registry. Default `'?'`.
   * It does not fire while an input has focus, so typing a question mark still works.
   * Pass `false` to open the dialog only through `isOpen`.
   */
  hotkey?: string | false | undefined;
  /** Also list shortcuts whose scope is not active right now. Default `false`. */
  includeInactive?: boolean | undefined;
  /** Message overrides for this instance. */
  messages?: ShortcutsHelpMessages | undefined;
  /** Class name for the dialog panel. */
  className?: string | undefined;
}

interface Group {
  title: string;
  hotkeys: RegisteredHotkey[];
}

/**
 * A dialog that lists the registered keyboard shortcuts (`useHotkeys` with a `description`),
 * grouped by their `group`, one table per group with the keys drawn by `Kbd`. Opens with `?` by
 * default. Place it once, anywhere under the app, and it stays in sync with what is mounted.
 */
export function ShortcutsHelp({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  hotkey = '?',
  includeInactive = false,
  messages: overrides,
  className,
}: ShortcutsHelpProps) {
  const t = useMessages('ShortcutsHelp', messages, overrides);
  const locale = useDSLocale();
  const [open, setOpen] = useControllableState<boolean>({
    value: isOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  useHotkeys([
    {
      keys: hotkey || '?',
      handler: () => {
        setOpen(true);
      },
      description: t.openDescription,
      group: t.openGroup,
      isDisabled: hotkey === false,
    },
  ]);

  const registered = useRegisteredHotkeys({ includeInactive });
  const groups = useMemo<Group[]>(() => {
    const byGroup = new Map<string, RegisteredHotkey[]>();
    for (const hotkeyEntry of registered) {
      const title = hotkeyEntry.group ?? t.ungrouped;
      const list = byGroup.get(title);
      if (list) list.push(hotkeyEntry);
      else byGroup.set(title, [hotkeyEntry]);
    }
    return [...byGroup.entries()]
      .sort(([a], [b]) => {
        // The catch-all group goes last, the others alphabetically.
        if (a === t.ungrouped) return 1;
        if (b === t.ungrouped) return -1;
        return compareText(a, b, locale);
      })
      .map(([title, hotkeys]) => ({
        title,
        hotkeys: [...hotkeys].sort((a, b) => compareText(a.description, b.description, locale)),
      }));
  }, [registered, t.ungrouped, locale]);

  return (
    <Dialog
      isOpen={open}
      onOpenChange={setOpen}
      size="md"
      title={t.title}
      description={t.description}
      className={classNames(className)}
      footer={({ close }) => <Button onPress={close}>{t.close}</Button>}
    >
      {groups.length === 0 ? (
        <p className={styles.empty}>{t.empty}</p>
      ) : (
        groups.map((group) => (
          <table key={group.title} className={styles.table}>
            <caption className={styles.caption}>{group.title}</caption>
            <thead>
              <tr>
                <th scope="col">
                  <VisuallyHidden>{t.action}</VisuallyHidden>
                </th>
                <th scope="col">
                  <VisuallyHidden>{t.keys}</VisuallyHidden>
                </th>
              </tr>
            </thead>
            <tbody>
              {group.hotkeys.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className={styles.action}>
                    {entry.description}
                  </th>
                  <td className={styles.keys}>
                    <Kbd keys={entry.keyParts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))
      )}
    </Dialog>
  );
}
