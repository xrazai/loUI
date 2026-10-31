import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the checkbox that selects one row. React Aria appends the row name (see `getRowLabel`): "Select row ORD-1001". */
    selectRow: 'Select row',
    /** Hidden header text of the selection column in `single` mode, where there is no select-all checkbox. */
    selection: 'Selection',
    /** Accessible name of the header checkbox. It selects the rows on the current page. */
    selectAll: 'Select all rows on this page',
    /** Visible and announced selection summary. `formatted` is `count` formatted for the locale. */
    selectedCount: (count: number, formatted: string) =>
      plural('en', count, {
        zero: 'None selected',
        one: '1 selected',
        other: `${formatted} selected`,
      }),
    /** Button of the bulk action bar that clears the selection. */
    clearSelection: 'Clear selection',
    /** Accessible name of the bulk action bar. */
    bulkActions: 'Actions for selected rows',
    /** Announced while the table shows loading rows. */
    loading: 'Loading rows',
    /** Title of the default empty state. */
    emptyTitle: 'No records found',
    /** Description of the default empty state. */
    emptyDescription: 'Try another filter or search term.',
  },
  'pt-BR': {
    selectRow: 'Selecionar linha',
    selection: 'Seleção',
    selectAll: 'Selecionar todas as linhas desta página',
    selectedCount: (count: number, formatted: string) =>
      plural('pt-BR', count, {
        zero: 'Nenhuma selecionada',
        one: '1 selecionada',
        other: `${formatted} selecionadas`,
      }),
    clearSelection: 'Limpar seleção',
    bulkActions: 'Ações para as linhas selecionadas',
    loading: 'Carregando linhas',
    emptyTitle: 'Nenhum registro encontrado',
    emptyDescription: 'Tente outro filtro ou termo de busca.',
  },
});
