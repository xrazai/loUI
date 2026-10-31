import { defineMessages } from '../../i18n';
import type { KbdKeyId } from './keys';

const enNames: Record<KbdKeyId, string> = {
  command: 'Command',
  control: 'Control',
  shift: 'Shift',
  alt: 'Option',
  enter: 'Enter',
  escape: 'Escape',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  space: 'Space',
  up: 'Up arrow',
  down: 'Down arrow',
  left: 'Left arrow',
  right: 'Right arrow',
  home: 'Home',
  end: 'End',
  pageUp: 'Page up',
  pageDown: 'Page down',
};

const enLabels: Record<KbdKeyId, string> = {
  command: 'Cmd',
  control: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  enter: 'Enter',
  escape: 'Esc',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Del',
  space: 'Space',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  home: 'Home',
  end: 'End',
  pageUp: 'PgUp',
  pageDown: 'PgDn',
};

const ptNames: Record<KbdKeyId, string> = {
  command: 'Command',
  control: 'Control',
  shift: 'Shift',
  alt: 'Option',
  enter: 'Enter',
  escape: 'Escape',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  space: 'Espaço',
  up: 'Seta para cima',
  down: 'Seta para baixo',
  left: 'Seta para a esquerda',
  right: 'Seta para a direita',
  home: 'Home',
  end: 'End',
  pageUp: 'Page Up',
  pageDown: 'Page Down',
};

const ptLabels: Record<KbdKeyId, string> = {
  command: 'Cmd',
  control: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  enter: 'Enter',
  escape: 'Esc',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Del',
  space: 'Espaço',
  up: 'Cima',
  down: 'Baixo',
  left: 'Esquerda',
  right: 'Direita',
  home: 'Home',
  end: 'End',
  pageUp: 'PgUp',
  pageDown: 'PgDn',
};

/**
 * `name` is the spoken name of a key (read by screen readers in place of its symbol);
 * `label` is the short text shown on keycaps that have no symbol on the platform.
 */
export const messages = defineMessages({
  en: {
    name: (key: KbdKeyId) => enNames[key],
    label: (key: KbdKeyId) => enLabels[key],
  },
  'pt-BR': {
    name: (key: KbdKeyId) => ptNames[key],
    label: (key: KbdKeyId) => ptLabels[key],
  },
});
