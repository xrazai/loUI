import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the rating. Arguments are already formatted for the locale. */
    label: (value: string, max: string, maxCount: number) =>
      plural('en', maxCount, {
        one: `${value} out of ${max} star`,
        other: `${value} out of ${max} stars`,
      }),
  },
  'pt-BR': {
    label: (value: string, max: string, maxCount: number) =>
      plural('pt-BR', maxCount, {
        one: `${value} de ${max} estrela`,
        other: `${value} de ${max} estrelas`,
      }),
  },
});
