import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the pagination navigation landmark. */
    navLabel: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    /** Accessible name of a page button; the button shows only the number. */
    page: (page: string) => `Page ${page}`,
    /** Visible and announced range of items. All arguments are already formatted for the locale. */
    range: (from: string, to: string, total: string) => `${from}–${to} of ${total}`,
    /** Visible and announced text when `total` is 0. */
    empty: 'No results',
    /** Visible and announced text when only the page count is known. */
    pageOf: (page: string, count: string) => `Page ${page} of ${count}`,
  },
  'pt-BR': {
    navLabel: 'Paginação',
    previous: 'Página anterior',
    next: 'Próxima página',
    page: (page: string) => `Página ${page}`,
    range: (from: string, to: string, total: string) => `${from}–${to} de ${total}`,
    empty: 'Nenhum resultado',
    pageOf: (page: string, count: string) => `Página ${page} de ${count}`,
  },
});
