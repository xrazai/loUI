import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** One segment in the summary read for the bar: "Cash 16%". Both arguments are already formatted. */
    segment: (label: string, percent: string) => `${label} ${percent}`,
    /** The whole summary. `items` is the list of segments joined for the locale ("Cash 16%, Card 11% and Pix 73%"); `label` names the bar, if given. */
    summary: (items: string, label?: string) => (label ? `${label}: ${items}` : items),
    /** Name of the unfilled part when `total` is larger than the sum of the segments: read in the summary and printed in the legend. */
    remaining: 'Remaining',
  },
  'pt-BR': {
    segment: (label: string, percent: string) => `${label} ${percent}`,
    summary: (items: string, label?: string) => (label ? `${label}: ${items}` : items),
    remaining: 'Restante',
  },
});
