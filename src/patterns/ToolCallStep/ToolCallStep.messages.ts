import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Visible status text of a step. */
    running: 'Running',
    succeeded: 'Succeeded',
    failed: 'Failed',
    /** Labels of the detail blocks, and the accessible names of their code blocks. */
    input: 'Input',
    output: 'Output',
    /** Label of the output block when the step failed. */
    error: 'Error',
    /** Polite announcement when a running step finishes. */
    finishedSucceeded: (name: string) => `${name} succeeded`,
    finishedFailed: (name: string) => `${name} failed`,
    /** Accessible name of a ToolCallList. */
    listLabel: 'Steps',
  },
  'pt-BR': {
    running: 'Em execução',
    succeeded: 'Concluída',
    failed: 'Falhou',
    input: 'Entrada',
    output: 'Saída',
    error: 'Erro',
    finishedSucceeded: (name: string) => `${name} concluída`,
    finishedFailed: (name: string) => `${name} falhou`,
    listLabel: 'Etapas',
  },
});
