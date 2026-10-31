import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Text of an upward trend. `percent` is already formatted for the locale ("12%"). */
    trendUp: (percent: string) => `Up ${percent}`,
    /** Text of a downward trend. */
    trendDown: (percent: string) => `Down ${percent}`,
    /** Text of a trend without change. */
    trendFlat: 'No change',
  },
  'pt-BR': {
    trendUp: (percent: string) => `Subiu ${percent}`,
    trendDown: (percent: string) => `Caiu ${percent}`,
    trendFlat: 'Sem variação',
  },
});
