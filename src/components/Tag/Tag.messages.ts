import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Name of the remove button of a tag: it includes the text of the tag. */
    remove: (label: string) => `Remove ${label}`,
  },
  'pt-BR': {
    remove: (label: string) => `Remover ${label}`,
  },
});
