import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Title of the dialog. */
    title: 'Keyboard shortcuts',
    /** Description under the title. */
    description: 'Shortcuts that work on this page.',
    /** Heading for shortcuts that have no `group`. */
    ungrouped: 'Other',
    /** Shown when no shortcut is registered. */
    empty: 'No keyboard shortcuts on this page.',
    /** Label of the button that closes the dialog. */
    close: 'Close',
    /** Column header: what the shortcut does. */
    action: 'Action',
    /** Column header: the keys. */
    keys: 'Shortcut',
    /** Description of the shortcut that opens the dialog. */
    openDescription: 'Show keyboard shortcuts',
    /** Group of the shortcut that opens the dialog. */
    openGroup: 'General',
  },
  'pt-BR': {
    title: 'Atalhos de teclado',
    description: 'Atalhos que funcionam nesta página.',
    ungrouped: 'Outros',
    empty: 'Nenhum atalho de teclado nesta página.',
    close: 'Fechar',
    action: 'Ação',
    keys: 'Atalho',
    openDescription: 'Mostrar atalhos de teclado',
    openGroup: 'Geral',
  },
});
