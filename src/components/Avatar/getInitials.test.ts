import { describe, expect, it } from 'vitest';
import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('takes the first letters of the first and last word', () => {
    expect(getInitials('Ada Lovelace', 'en-US')).toBe('AL');
    expect(getInitials('Ana Maria da Silva', 'pt-BR')).toBe('AS');
  });

  it('returns one letter for a single word and nothing for an empty name', () => {
    expect(getInitials('Madonna', 'en-US')).toBe('M');
    expect(getInitials('   ', 'en-US')).toBe('');
    expect(getInitials('', 'en-US')).toBe('');
  });

  it('keeps accented letters and combined characters whole', () => {
    expect(getInitials('élodie Çelik', 'fr-FR')).toBe('ÉÇ');
    expect(getInitials('émile zola', 'fr-FR')).toBe('ÉZ');
  });

  it('follows the locale casing rules', () => {
    expect(getInitials('irmak ilgaz', 'tr-TR')).toBe('İİ');
    expect(getInitials('irmak ilgaz', 'en-US')).toBe('II');
  });

  it('ignores punctuation and handles hyphenated names', () => {
    expect(getInitials('  Jean-Luc  Picard ', 'en-US')).toBe('JP');
    expect(getInitials('(Ada) Lovelace', 'en-US')).toBe('AL');
  });
});
