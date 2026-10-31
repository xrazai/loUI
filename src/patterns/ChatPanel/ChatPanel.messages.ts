import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Default heading of the panel. */
    title: 'Chat with the agent',
    /** Clear button in the header. */
    clear: 'Clear conversation',
    /** Accessible name of the message list (`role="log"`). */
    transcript: 'Conversation',
    /** Accessible name of the composer field. */
    composerLabel: 'Message',
    /** Default placeholder of the composer. */
    placeholder: 'Ask or request something',
    /** Composer button while it can send, and while the assistant is working (it stops). */
    send: 'Send message',
    stop: 'Stop generating',
    /** Visible busy text and the announcement while waiting for the first part of a reply. */
    thinking: 'Thinking…',
    /** Announcement when a reply starts streaming. The text itself is announced once, when complete. */
    responding: 'The assistant is responding',
    /** Visually hidden author prefix of each message. */
    you: 'You',
    assistant: 'Assistant',
    error: 'Error',
    /** Retry button of a failed reply. */
    retry: 'Retry',
    /** Shown while the list is scrolled away from the latest message. */
    jumpToLatest: 'Jump to latest',
    /** Accessible name of the group of suggested prompts. */
    suggestions: 'Suggested prompts',
    /** Announcements made when a reply is complete or failed. */
    assistantSaid: (text: string) => `Assistant: ${text}`,
    errorSaid: (text: string) => `Error: ${text}`,
  },
  'pt-BR': {
    title: 'Conversar com o agente',
    clear: 'Limpar conversa',
    transcript: 'Conversa',
    composerLabel: 'Mensagem',
    placeholder: 'Pergunte ou peça algo',
    send: 'Enviar mensagem',
    stop: 'Parar de gerar',
    thinking: 'Pensando…',
    responding: 'O assistente está respondendo',
    you: 'Você',
    assistant: 'Assistente',
    error: 'Erro',
    retry: 'Tentar de novo',
    jumpToLatest: 'Ir para a última',
    suggestions: 'Sugestões de perguntas',
    assistantSaid: (text: string) => `Assistente: ${text}`,
    errorSaid: (text: string) => `Erro: ${text}`,
  },
});
