import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Name of the list of added tags. `fieldLabel` is the text label of the field, when it has one. */
    tagsLabel: (fieldLabel?: string) => (fieldLabel ? `${fieldLabel}, added tags` : 'Added tags'),
    /** Announced (polite) after one tag is added. */
    added: (tag: string) => `Added “${tag}”.`,
    /** Announced (polite) after several tags are added at once (paste). */
    addedMany: (count: number) =>
      plural('en', count, { one: 'Added 1 tag.', other: `Added ${String(count)} tags.` }),
    /** Announced (polite) after a tag is removed with Backspace on the empty input. */
    removed: (tag: string) => `Removed “${tag}”.`,
    /** Shown and announced (polite) when a typed tag is already in the list and was ignored. */
    duplicate: (tag: string) => `“${tag}” is already added.`,
    /** Shown and announced (polite) when several pasted tags were ignored as duplicates. */
    duplicates: (count: number) =>
      plural('en', count, {
        one: '1 duplicate tag was skipped.',
        other: `${String(count)} duplicate tags were skipped.`,
      }),
    /** Error shown when the user tries to add a tag beyond the maximum. */
    maxReached: (max: number) =>
      plural('en', max, {
        one: 'You can add only 1 tag.',
        other: `You can add up to ${String(max)} tags.`,
      }),
  },
  'pt-BR': {
    tagsLabel: (fieldLabel?: string) =>
      fieldLabel ? `${fieldLabel}, tags adicionadas` : 'Tags adicionadas',
    added: (tag: string) => `“${tag}” adicionada.`,
    addedMany: (count: number) =>
      plural('pt-BR', count, {
        one: '1 tag adicionada.',
        other: `${String(count)} tags adicionadas.`,
      }),
    removed: (tag: string) => `“${tag}” removida.`,
    duplicate: (tag: string) => `“${tag}” já foi adicionada.`,
    duplicates: (count: number) =>
      plural('pt-BR', count, {
        one: '1 tag repetida foi ignorada.',
        other: `${String(count)} tags repetidas foram ignoradas.`,
      }),
    maxReached: (max: number) =>
      plural('pt-BR', max, {
        one: 'Você pode adicionar apenas 1 tag.',
        other: `Você pode adicionar até ${String(max)} tags.`,
      }),
  },
});
