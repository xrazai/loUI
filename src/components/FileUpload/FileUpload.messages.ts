import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the drop target itself (React Aria adds a keyboard stop on it that accepts pasted files). */
    dropZone: 'Drop zone',
    /** Text of the drop target, which names it for assistive technology. */
    dropLabel: (multiple: boolean): string => (multiple ? 'Drop files here' : 'Drop a file here'),
    /** The button that opens the file dialog (the keyboard and click alternative to dragging). */
    choose: (multiple: boolean): string => (multiple ? 'Choose files' : 'Choose a file'),
    /** Accessible name of the list of added files. */
    listLabel: 'Added files',
    /** Accessible name of the remove button of a file. */
    remove: (name: string) => `Remove ${name}`,
    /** Accessible name of the progress bar of a file that is uploading. */
    uploading: (name: string) => `Uploading ${name}`,
    /** Status text of a file whose progress reached 100. */
    done: 'Done',
    /** Size units shown after the number. */
    unitB: 'B',
    unitKB: 'KB',
    unitMB: 'MB',
    unitGB: 'GB',
    /** Error: the file type is not accepted. */
    wrongType: (name: string) => `"${name}" is not an accepted file type.`,
    /** Error: the file is larger than the limit (already formatted, e.g. "10 MB"). */
    tooLarge: (name: string, max: string) => `"${name}" is larger than ${max}.`,
    /** Error: files over the count limit were not added. */
    tooMany: (max: number, skipped: number) =>
      plural('en', max, {
        one: `Only 1 file can be added. ${String(skipped)} not added.`,
        other: `Only ${String(max)} files can be added. ${String(skipped)} not added.`,
      }),
    /** Live announcement after files were added. */
    added: (n: number) =>
      plural('en', n, { one: '1 file added', other: `${String(n)} files added` }),
    /** Live announcement after a file was removed. */
    removed: (name: string) => `Removed ${name}`,
  },
  'pt-BR': {
    dropLabel: (multiple: boolean): string =>
      multiple ? 'Solte os arquivos aqui' : 'Solte um arquivo aqui',
    choose: (multiple: boolean): string => (multiple ? 'Escolher arquivos' : 'Escolher um arquivo'),
    dropZone: 'Área para soltar arquivos',
    listLabel: 'Arquivos adicionados',
    remove: (name: string) => `Remover ${name}`,
    uploading: (name: string) => `Enviando ${name}`,
    done: 'Concluído',
    unitB: 'B',
    unitKB: 'KB',
    unitMB: 'MB',
    unitGB: 'GB',
    wrongType: (name: string) => `"${name}" não é um tipo de arquivo aceito.`,
    tooLarge: (name: string, max: string) => `"${name}" é maior que ${max}.`,
    tooMany: (max: number, skipped: number) =>
      plural('pt-BR', max, {
        one: `Só é possível adicionar 1 arquivo. ${String(skipped)} não adicionado(s).`,
        other: `Só é possível adicionar ${String(max)} arquivos. ${String(skipped)} não adicionado(s).`,
      }),
    added: (n: number) =>
      plural('pt-BR', n, {
        one: '1 arquivo adicionado',
        other: `${String(n)} arquivos adicionados`,
      }),
    removed: (name: string) => `${name} removido`,
  },
});
