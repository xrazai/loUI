import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the palette dialog. */
    title: 'Command palette',
    /** Placeholder and accessible name of the search field. */
    placeholder: 'Search or run a command',
    /** Accessible name of the list of commands. */
    commands: 'Commands',
    /** Heading of the group of recently run commands. */
    recent: 'Recent',
    /** Heading for commands that have no `group`. */
    ungrouped: 'Commands',
    /** Heading for registered shortcuts that have no `group` (when `includeHotkeys` is set). */
    shortcuts: 'Shortcuts',
    /** Shown when no command matches the search. */
    noResults: 'No commands found',
    /** Second line of the empty state: what to do next. */
    noResultsHint: 'Try another search term.',
    /** Description of the shortcut that opens the palette, listed by `ShortcutsHelp`. */
    openDescription: 'Open the command palette',
    /** Group of the shortcut that opens the palette. */
    openGroup: 'General',
    /** Spoken after each search: how many commands match. */
    resultCount: (n: number) =>
      plural('en', n, { zero: 'No commands found', one: '1 command', other: `${n} commands` }),
  },
  'pt-BR': {
    title: 'Paleta de comandos',
    placeholder: 'Buscar ou executar um comando',
    commands: 'Comandos',
    recent: 'Recentes',
    ungrouped: 'Comandos',
    shortcuts: 'Atalhos',
    noResults: 'Nenhum comando encontrado',
    noResultsHint: 'Tente outro termo de busca.',
    openDescription: 'Abrir a paleta de comandos',
    openGroup: 'Geral',
    resultCount: (n: number) =>
      plural('pt-BR', n, {
        zero: 'Nenhum comando encontrado',
        one: '1 comando',
        other: `${n} comandos`,
      }),
  },
});
