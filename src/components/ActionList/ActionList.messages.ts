import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the row actions button. `title` is the text of the row ("More actions for Price list"). */
    moreActions: (title: string) => `More actions for ${title}`,
    /** Title of the default empty state. */
    emptyTitle: 'No items found',
    /** Description of the default empty state. */
    emptyDescription: 'Try another filter or search term.',
  },
  'pt-BR': {
    moreActions: (title: string) => `Mais ações para ${title}`,
    emptyTitle: 'Nenhum item encontrado',
    emptyDescription: 'Tente outro filtro ou termo de busca.',
  },
});
