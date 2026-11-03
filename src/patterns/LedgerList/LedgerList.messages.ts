import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Label of the running balance after an entry. `amount` is already formatted. */
    balance: (amount: string) => `Balance ${amount}`,
    /** Accessible name of the edit button of an entry; `title` is the entry's title. */
    editEntry: (title: string) => `Edit entry ${title}`,
    /** Accessible name of the delete button of an entry; `title` is the entry's title. */
    deleteEntry: (title: string) => `Delete entry ${title}`,
  },
  'pt-BR': {
    balance: (amount: string) => `Saldo ${amount}`,
    editEntry: (title: string) => `Editar lançamento ${title}`,
    deleteEntry: (title: string) => `Excluir lançamento ${title}`,
  },
});
