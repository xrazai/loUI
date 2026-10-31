import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of a toggle cell: the row, the column and the state of the link. */
    cell: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'linked' : 'not linked'}`,
    /** Accessible name of the focusable scroll region around the grid. `name` is the grid's name. */
    scrollRegion: (name: string) => `${name}, scrollable`,
    /** Hidden header text of the first column when no `cornerLabel` is given. */
    rowHeader: 'Row',
  },
  'pt-BR': {
    cell: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'vinculado' : 'não vinculado'}`,
    scrollRegion: (name: string) => `${name}, rolável`,
    rowHeader: 'Linha',
  },
});
