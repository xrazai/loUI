import { defineMessages } from '../../i18n';

/**
 * Messages shared by every form field. Consumers override them per instance (`messages` prop)
 * or for the whole app through `DSProvider messages={{ Field: { ... } }}`.
 */
export const messages = defineMessages({
  en: {
    /** Visible marker after the label of a required field. Hidden from assistive technology. */
    requiredMark: '*',
  },
  'pt-BR': {
    requiredMark: '*',
  },
});
