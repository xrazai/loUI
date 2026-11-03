import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of a toggle cell: the row, the column and the state of the link. */
    cell: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'linked' : 'not linked'}`,
    /** Accessible name of a cell while its toggle request is running. */
    cellPending: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'linked' : 'not linked'}, saving`,
    /** Status announced when a toggle request fails; the cell keeps its previous state. */
    toggleFailed: (row: string, column: string) => `Couldn't update ${row} · ${column}. Try again.`,
    /** Accessible name of the focusable scroll region around the grid. `name` is the grid's name. */
    scrollRegion: (name: string) => `${name}, scrollable`,
    /** Hidden header text of the first column when no `cornerLabel` is given. */
    rowHeader: 'Row',
  },
  'pt-BR': {
    cell: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'vinculado' : 'não vinculado'}`,
    cellPending: (row: string, column: string, linked: boolean) =>
      `${row} · ${column}: ${linked ? 'vinculado' : 'não vinculado'}, salvando`,
    toggleFailed: (row: string, column: string) =>
      `Não foi possível atualizar ${row} · ${column}. Tente novamente.`,
    scrollRegion: (name: string) => `${name}, rolável`,
    rowHeader: 'Linha',
  },
});
