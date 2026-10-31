import { useEffect, useMemo, useRef, useState } from 'react';
import type { Ref } from 'react';
import {
  Autocomplete,
  Dialog as AriaDialog,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Modal,
  ModalOverlay,
  SearchField,
} from 'react-aria-components';

import { hotkeyKeys } from '../../hooks/hotkey';
import { useControllableState } from '../../hooks/useControllableState';
import { useHotkeys, useRegisteredHotkeys } from '../../hooks/useHotkeys';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { compareText, highlightMatch, matchesSearch } from '../../utils/text';
import { Icon } from '../Icon';
import { SearchIcon } from '../Icon/icons';
import type { IconComponent } from '../Icon/icons';
import { Kbd } from '../Kbd';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './CommandPalette.messages';
import styles from './CommandPalette.module.css';

export interface Command {
  /** Unique, stable id. It is what `onRun` reports and what `recentIds` lists. */
  id: string;
  /**
   * What the command does: a verb plus object in sentence case ("Create order"). It is the
   * accessible name and the text that is highlighted.
   */
  label: string;
  /** Heading the command is listed under ("Navigation", "Orders"). Commands without one go under a generic heading. */
  group?: string | undefined;
  /** Extra search terms that find the command without being shown ("invoice", "new"). Matched like the label: ignoring case and accents. */
  keywords?: readonly string[] | undefined;
  /**
   * The shortcut to show next to the label, as a combo (`'Mod+Shift+P'`, `'F2'`) or as `Kbd` keys
   * (`['Mod', 'K']`). Display only: it does not bind the key. Register it with `useHotkeys`, or
   * set `includeHotkeys` and let the registry feed the palette.
   */
  shortcut?: string | readonly string[] | undefined;
  /** Icon drawn before the label, one of the curated set exported from this package. Decorative. */
  icon?: IconComponent | undefined;
  /** Runs when the user chooses the command, once the palette has closed. */
  onAction: () => void;
  /** Dims the command and makes it impossible to run. It stays searchable so users learn it exists. */
  isDisabled?: boolean | undefined;
}

export type CommandPaletteMessages = Partial<typeof messages.en>;

export interface CommandPaletteProps {
  /** The commands. Search covers the label, the keywords and the group. */
  commands: readonly Command[];
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the palette opens (from the hotkey) or closes (Escape, outside press, a command ran). */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  /**
   * The shortcut that opens the palette, registered in the hotkey registry. Default `'Mod+K'`.
   * It works while an input has focus. Pass `false` to open the palette only through `isOpen`.
   */
  hotkey?: string | false | undefined;
  /**
   * Also list every shortcut registered with `useHotkeys` that has a `description`, as a command
   * that runs its handler (grouped by the shortcut's `group`, or under "Shortcuts"). A registered
   * shortcut whose description equals a command's label is listed once. Default `false`.
   */
  includeHotkeys?: boolean | undefined;
  /**
   * Ids of recently run commands, most recent first, shown under "Recent" while the search is
   * empty. Persisting them is up to the app: collect them in `onRun`.
   */
  recentIds?: readonly string[] | undefined;
  /** Most recent commands shown. Default `5`. */
  maxRecent?: number | undefined;
  /** Called after a command was chosen, with its id, so the app can update `recentIds`. */
  onRun?: ((commandId: string) => void) | undefined;
  /**
   * Order of groups and commands. `alphabetical` (default) sorts both with the active locale,
   * ignoring accents; `given` keeps the order of `commands` and lists groups in order of first use.
   */
  sort?: 'alphabetical' | 'given' | undefined;
  /** Placeholder and accessible name of the search field. Default from messages: "Search or run a command". */
  placeholder?: string | undefined;
  /** Message overrides for this instance. */
  messages?: CommandPaletteMessages | undefined;
  /** Class name for the palette panel. */
  className?: string | undefined;
  /** Ref to the panel (`role="dialog"`). */
  ref?: Ref<HTMLElement> | undefined;
}

interface Row {
  key: string;
  command: Command;
  /** Resolved so commands and registered shortcuts share one path. */
  run: () => void;
}

interface Section {
  key: string;
  title: string;
  rows: Row[];
}

const RECENT_PREFIX = 'recent:';

/** What search matches: the label, the keywords and the group. */
function searchText(command: Command): string {
  return [command.label, ...(command.keywords ?? []), command.group ?? ''].join(' ');
}

function matches(row: Row, query: string): boolean {
  return matchesSearch(searchText(row.command), query);
}

function shortcutParts(shortcut: Command['shortcut']): readonly string[] {
  if (shortcut === undefined) return [];
  return typeof shortcut === 'string' ? hotkeyKeys(shortcut) : shortcut;
}

/**
 * A command palette: a modal with a search field and a grouped list of commands, opened with
 * `Mod+K` (configurable). Built on React Aria `Autocomplete`, `SearchField` and `ListBox` inside a
 * `ModalOverlay`: the search field is a combobox that keeps focus while the arrow keys move
 * through the commands (`aria-activedescendant`), `Enter` runs the highlighted command and
 * closes, `Escape` closes and focus returns to where it was.
 *
 * Search ignores case and accents and matches label, keywords and group. With `includeHotkeys`
 * it also lists the shortcuts registered through `useHotkeys`.
 */
export function CommandPalette({
  commands,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  hotkey = 'Mod+K',
  includeHotkeys = false,
  recentIds,
  maxRecent = 5,
  onRun,
  sort = 'alphabetical',
  placeholder,
  messages: overrides,
  className,
  ref,
}: CommandPaletteProps) {
  const t = useMessages('CommandPalette', messages, overrides);
  const [open, setOpen] = useControllableState<boolean>({
    value: isOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  // The command chosen by the user runs when the panel has finished closing, so focus is already
  // back where it was and a dialog opened by the command does not lose focus to the restore.
  const pending = useRef<(() => void) | null>(null);

  useHotkeys([
    {
      keys: hotkey || 'Mod+K',
      handler: () => {
        setOpen(true);
      },
      description: t.openDescription,
      group: t.openGroup,
      allowInEditable: true,
      isDisabled: hotkey === false,
    },
  ]);

  const registered = useRegisteredHotkeys();
  const fromHotkeys = useMemo<Row[]>(() => {
    if (!includeHotkeys) return [];
    const own = hotkey === false ? '' : hotkey.toLowerCase();
    const labels = new Set(commands.map((command) => command.label.toLocaleLowerCase()));
    return registered
      .filter(
        (entry) =>
          entry.keys.toLowerCase() !== own && !labels.has(entry.description.toLocaleLowerCase()),
      )
      .map((entry) => ({
        key: `hotkey:${entry.id}`,
        command: {
          id: `hotkey:${entry.id}`,
          label: entry.description,
          group: entry.group ?? t.shortcuts,
          shortcut: entry.keyParts,
          onAction: entry.run,
        },
        run: entry.run,
      }));
  }, [includeHotkeys, hotkey, commands, registered, t.shortcuts]);

  const rows = useMemo<Row[]>(
    () => [
      ...commands.map((command) => ({ key: command.id, command, run: command.onAction })),
      ...fromHotkeys,
    ],
    [commands, fromHotkeys],
  );

  const close = () => {
    setOpen(false);
  };

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={setOpen}
      isDismissable
      className={classNames(styles.overlay)}
      // RAC writes an inline z-index; the style prop is the only way to use the dialog layer.
      style={{ zIndex: 'var(--ds-z-dialog)' }}
    >
      <Modal className={classNames(styles.modal)}>
        <PaletteBody
          rows={rows}
          recentIds={recentIds ?? []}
          maxRecent={maxRecent}
          sort={sort}
          placeholder={placeholder ?? t.placeholder}
          messages={overrides}
          className={className}
          ref={ref}
          onClose={close}
          onChoose={(row) => {
            pending.current = () => {
              row.run();
            };
            onRun?.(row.command.id);
            close();
          }}
          onExited={() => {
            const action = pending.current;
            pending.current = null;
            action?.();
          }}
        />
      </Modal>
    </ModalOverlay>
  );
}

interface PaletteBodyProps {
  rows: readonly Row[];
  recentIds: readonly string[];
  maxRecent: number;
  sort: 'alphabetical' | 'given';
  placeholder: string;
  messages: CommandPaletteMessages | undefined;
  className: string | undefined;
  ref: Ref<HTMLElement> | undefined;
  onClose: () => void;
  onChoose: (row: Row) => void;
  onExited: () => void;
}

/** Mounted only while the palette is open, so the search text resets every time. */
function PaletteBody({
  rows,
  recentIds,
  maxRecent,
  sort,
  placeholder,
  messages: overrides,
  className,
  ref,
  onClose,
  onChoose,
  onExited,
}: PaletteBodyProps) {
  const t = useMessages('CommandPalette', messages, overrides);
  const locale = useDSLocale();
  const [query, setQuery] = useState('');

  // Runs the chosen command once the panel is gone: the cleanup runs when React Aria unmounts the
  // exiting panel, after its animation and after focus was restored.
  const exited = useRef(onExited);
  useEffect(() => {
    exited.current = onExited;
  });
  useEffect(
    () => () => {
      exited.current();
    },
    [],
  );

  // The list always holds every command; React Aria's `filter` hides the ones that do not match,
  // so it also keeps the highlighted item valid while the list shrinks.
  const sections = useMemo<Section[]>(() => {
    const byGroup = new Map<string, Row[]>();
    for (const row of rows) {
      const title = row.command.group ?? t.ungrouped;
      const list = byGroup.get(title);
      if (list) list.push(row);
      else byGroup.set(title, [row]);
    }
    let titles = [...byGroup.keys()];
    if (sort === 'alphabetical') titles = titles.sort((a, b) => compareText(a, b, locale));
    const result = titles.map<Section>((title) => {
      const list = byGroup.get(title) ?? [];
      return {
        key: `group:${title}`,
        title,
        rows:
          sort === 'alphabetical'
            ? [...list].sort((a, b) => compareText(a.command.label, b.command.label, locale))
            : list,
      };
    });
    const byId = new Map(rows.map((row) => [row.command.id, row]));
    const recent = recentIds
      .map((id) => byId.get(id))
      .filter((row): row is Row => row !== undefined && !row.command.isDisabled)
      .slice(0, Math.max(0, maxRecent))
      .map((row) => ({ ...row, key: `${RECENT_PREFIX}${row.key}` }));
    if (recent.length > 0) result.unshift({ key: 'recent', title: t.recent, rows: recent });
    return result;
  }, [rows, sort, locale, recentIds, maxRecent, t.ungrouped, t.recent]);

  const count = query.trim() === '' ? 0 : rows.filter((row) => matches(row, query)).length;
  const byKey = useMemo(() => {
    const map = new Map<string, Row>();
    for (const section of sections) for (const row of section.rows) map.set(row.key, row);
    return map;
  }, [sections]);

  // Escape always closes. Without this the search field would first clear its text. A native
  // capture listener stops the event before React Aria's handlers on the field see it.
  const frame = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const element = frame.current;
    if (!element) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      event.stopPropagation();
      event.preventDefault();
      close.current();
    };
    element.addEventListener('keydown', onKeyDown, true);
    return () => {
      element.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  return (
    <AriaDialog ref={ref} aria-label={t.title} className={classNames(styles.dialog, className)}>
      <div ref={frame} className={styles.frame}>
        <Autocomplete
          inputValue={query}
          onInputChange={setQuery}
          filter={(text, input, node) =>
            String(node.key).startsWith(RECENT_PREFIX)
              ? input.trim() === ''
              : matchesSearch(text, input)
          }
        >
          {/* eslint-disable-next-line jsx-a11y-x/no-autofocus -- the palette exists to be typed into: focus goes to the search field when it opens, as the dialog pattern asks for the first useful element. */}
          <SearchField aria-label={placeholder} autoFocus className={classNames(styles.search)}>
            <Icon icon={SearchIcon} size="sm" className={classNames(styles.searchIcon)} />
            <Input
              role="combobox"
              aria-expanded="true"
              aria-haspopup="listbox"
              placeholder={placeholder}
              className={classNames(styles.input)}
            />
          </SearchField>
          <ListBox
            aria-label={t.commands}
            // eslint-disable-next-line jsx-a11y-x/no-autofocus -- virtual focus: highlights the first command so Enter works at once; DOM focus stays in the search field.
            autoFocus="first"
            className={classNames(styles.list)}
            onAction={(key) => {
              const row = byKey.get(String(key));
              if (row && !row.command.isDisabled) onChoose(row);
            }}
            renderEmptyState={() => (
              <div className={styles.empty}>
                <span className={styles.emptyTitle}>{t.noResults}</span>
                <span className={styles.emptyHint}>{t.noResultsHint}</span>
              </div>
            )}
          >
            {sections.map((section) => (
              <ListBoxSection key={section.key} className={classNames(styles.section)}>
                <Header className={classNames(styles.sectionHeader)}>{section.title}</Header>
                {section.rows.map((row) => (
                  <CommandItem key={row.key} row={row} query={query} />
                ))}
              </ListBoxSection>
            ))}
          </ListBox>
        </Autocomplete>
        <VisuallyHidden role="status">
          {query.trim() === '' ? '' : t.resultCount(count)}
        </VisuallyHidden>
      </div>
    </AriaDialog>
  );
}

function CommandItem({ row, query }: { row: Row; query: string }) {
  const { command } = row;
  const parts = shortcutParts(command.shortcut);
  return (
    <ListBoxItem
      id={row.key}
      textValue={searchText(command)}
      isDisabled={command.isDisabled ?? false}
      className={classNames(styles.item)}
    >
      {command.icon ? (
        <Icon icon={command.icon} size="sm" className={classNames(styles.icon)} />
      ) : null}
      <span className={classNames(styles.label)}>
        {highlightMatch(command.label, query).map((segment, index) =>
          segment.match ? (
            <mark key={index} className={styles.mark}>
              {segment.text}
            </mark>
          ) : (
            segment.text
          ),
        )}
      </span>
      {parts.length > 0 ? (
        <span className={classNames(styles.shortcut)}>
          <Kbd keys={parts} />
        </span>
      ) : null}
    </ListBoxItem>
  );
}
