import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the row actions button. `title` is the text of the row ("More actions for Price list"). */
    moreActions: (title: string) => `More actions for ${title}`,
    /**
     * Start of the accessible name of a row checkbox. React Aria appends the text of the row
     * ("Select" + "Price list 2026"), so keep it a bare verb.
     */
    select: 'Select',
    /** Visually hidden text added to a row marked `isDone`, read after the title. */
    done: 'Done',
    /** Title of the default empty state. */
    emptyTitle: 'No items found',
    /** Description of the default empty state. */
    emptyDescription: 'Try another filter or search term.',
  },
  'pt-BR': {
    moreActions: (title: string) => `Mais ações para ${title}`,
    select: 'Selecionar',
    done: 'Concluído',
    emptyTitle: 'Nenhum item encontrado',
    emptyDescription: 'Tente outro filtro ou termo de busca.',
  },
});
