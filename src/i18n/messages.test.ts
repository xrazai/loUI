import { describe, expect, it } from 'vitest';
import { defineMessages, mergeMessages, resolveMessages } from './messages';
import { plural } from './plural';
import { getLanguage, normalizeLocale } from './locales';

const catalog = defineMessages({
  en: {
    close: 'Close',
    clear: 'Clear',
    selected: (n: number) =>
      plural('en', n, { zero: 'None selected', one: '1 selected', other: `${n} selected` }),
  },
  'pt-BR': {
    close: 'Fechar',
    clear: 'Limpar',
    selected: (n: number) =>
      plural('pt-BR', n, { one: `${n} selecionado`, other: `${n} selecionados` }),
  },
  // A language-only catalog, as a consumer could add it.
  es: { close: 'Cerrar', clear: 'Borrar', selected: (n: number) => `${n} seleccionados` },
  // A partial regional catalog.
  'es-MX': { close: 'Cerrar (MX)' } as never,
});

describe('resolveMessages', () => {
  it('uses the exact locale catalog', () => {
    expect(resolveMessages(catalog, 'pt-BR').close).toBe('Fechar');
  });

  it('falls back from a regional locale to the language catalog, then English', () => {
    // pt-PT -> pt (no catalog; pt-BR is not a parent of pt-PT) -> en
    expect(resolveMessages(catalog, 'pt-PT').close).toBe('Close');
  });

  it('falls back from en-US to the en catalog', () => {
    expect(resolveMessages(catalog, 'en-US').close).toBe('Close');
    expect(resolveMessages(catalog, 'en-GB').close).toBe('Close');
  });

  it('prefers the language catalog over English when the exact locale is missing', () => {
    expect(resolveMessages(catalog, 'es-AR').close).toBe('Cerrar');
  });

  it('prefers the exact locale over the language, per key', () => {
    const messages = resolveMessages(catalog, 'es-MX');
    expect(messages.close).toBe('Cerrar (MX)');
    expect(messages.clear).toBe('Borrar'); // missing in es-MX -> es
  });

  it('falls back to English for unknown locales', () => {
    expect(resolveMessages(catalog, 'ja-JP').close).toBe('Close');
  });

  it('falls back to English for malformed locales', () => {
    expect(resolveMessages(catalog, 'not a locale!!').close).toBe('Close');
  });

  it('canonicalizes the casing of the locale tag', () => {
    expect(resolveMessages(catalog, 'pt-br').close).toBe('Fechar');
  });

  it('applies provider overrides over the catalog', () => {
    expect(resolveMessages(catalog, 'pt-BR', { close: 'Dispensar' }).close).toBe('Dispensar');
    expect(resolveMessages(catalog, 'pt-BR', { close: 'Dispensar' }).clear).toBe('Limpar');
  });

  it('applies instance overrides over provider overrides', () => {
    const messages = resolveMessages(
      catalog,
      'en-US',
      { close: 'Provider' },
      { close: 'Instance' },
    );
    expect(messages.close).toBe('Instance');
  });

  it('ignores undefined override values', () => {
    const messages = resolveMessages(catalog, 'en-US', { close: undefined }, { close: undefined });
    expect(messages.close).toBe('Close');
  });

  it('allows overriding with functions', () => {
    const messages = resolveMessages(catalog, 'en-US', { selected: (n: number) => `${n} chosen` });
    expect(messages.selected(3)).toBe('3 chosen');
  });

  it('does not mutate the catalog', () => {
    resolveMessages(catalog, 'en-US', { close: 'X' }, { close: 'Y' });
    expect(catalog.en.close).toBe('Close');
  });
});

describe('catalog functions', () => {
  it('pluralizes English', () => {
    const { selected } = resolveMessages(catalog, 'en-US');
    expect([selected(0), selected(1), selected(2)]).toEqual([
      'None selected',
      '1 selected',
      '2 selected',
    ]);
  });

  it('pluralizes Brazilian Portuguese (0 and 1 are singular)', () => {
    const { selected } = resolveMessages(catalog, 'pt-BR');
    expect([selected(0), selected(1), selected(2)]).toEqual([
      '0 selecionado',
      '1 selecionado',
      '2 selecionados',
    ]);
  });
});

describe('mergeMessages', () => {
  it('merges left to right and skips empty layers', () => {
    expect(mergeMessages([{ a: '1', b: '1' }, undefined, { b: '2' }])).toEqual({ a: '1', b: '2' });
  });
});

describe('plural', () => {
  it('uses CLDR categories', () => {
    expect(plural('en', 1, { one: 'one', other: 'other' })).toBe('one');
    expect(plural('en', 2, { one: 'one', other: 'other' })).toBe('other');
    expect(plural('ar', 2, { two: 'two', other: 'other' })).toBe('two');
    expect(plural('pl', 5, { few: 'few', many: 'many', other: 'other' })).toBe('many');
    expect(plural('pl', 3, { few: 'few', many: 'many', other: 'other' })).toBe('few');
  });

  it('falls back to other when the category is not provided', () => {
    expect(plural('en', 1, { other: 'other' })).toBe('other');
  });

  it('honors an explicit zero form only for 0', () => {
    expect(plural('en', 0, { zero: 'none', other: 'many' })).toBe('none');
    expect(plural('en', 0, { other: 'many' })).toBe('many');
    expect(plural('en', 5, { zero: 'none', other: 'many' })).toBe('many');
  });

  it('handles decimals', () => {
    expect(plural('en', 1.5, { one: 'one', other: 'other' })).toBe('other');
  });
});

describe('locales', () => {
  it('normalizes and extracts languages', () => {
    expect(normalizeLocale('pt-br')).toBe('pt-BR');
    expect(normalizeLocale('???')).toBe('en-US');
    expect(getLanguage('pt-BR')).toBe('pt');
    expect(getLanguage('zh-Hant-TW')).toBe('zh');
    expect(getLanguage('???')).toBe('en');
  });
});
