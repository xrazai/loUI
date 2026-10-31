import { describe, expect, it } from 'vitest';
import { matchesAccept, splitSize, validateFiles } from './FileUpload.validation';

function file(name: string, size = 10, type = ''): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('matchesAccept', () => {
  it('accepts everything without rules', () => {
    expect(matchesAccept(file('a.bin'), undefined)).toBe(true);
    expect(matchesAccept(file('a.bin'), [])).toBe(true);
  });

  it('matches MIME types, wildcards and extensions, ignoring case', () => {
    expect(matchesAccept(file('a', 1, 'image/png'), ['image/png'])).toBe(true);
    expect(matchesAccept(file('a', 1, 'image/png'), ['image/*'])).toBe(true);
    expect(matchesAccept(file('a', 1, 'IMAGE/PNG'), ['image/png'])).toBe(true);
    expect(matchesAccept(file('Doc.PDF'), ['.pdf'])).toBe(true);
    expect(matchesAccept(file('a.txt', 1, 'text/plain'), ['image/*', '.pdf'])).toBe(false);
    expect(matchesAccept(file('a.png', 1, 'image/png'), ['video/*'])).toBe(false);
  });
});

describe('validateFiles', () => {
  it('rejects by type, size and count in order, keeping the accepted ones', () => {
    const result = validateFiles(
      [],
      [file('a.pdf'), file('b.png'), file('c.pdf', 500), file('d.pdf')],
      {
        accept: ['.pdf'],
        maxSize: 100,
        maxFiles: 1,
      },
    );
    expect(result.accepted.map((f) => f.name)).toEqual(['a.pdf']);
    expect(result.rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ['b.png', 'type'],
      ['c.pdf', 'size'],
      ['d.pdf', 'count'],
    ]);
  });

  it('counts the current files against maxFiles, except in single-file mode', () => {
    const current = [file('x'), file('y')];
    expect(validateFiles(current, [file('z')], { maxFiles: 2 }).rejected).toHaveLength(1);
    expect(validateFiles(current, [file('z')], { maxFiles: 3 }).accepted).toHaveLength(1);
    expect(validateFiles([file('x')], [file('z')], { maxFiles: 1 }).accepted).toHaveLength(1);
  });
});

describe('splitSize', () => {
  it('picks the unit with 1024 steps', () => {
    expect(splitSize(0)).toEqual({ value: 0, unit: 'B' });
    expect(splitSize(1023)).toEqual({ value: 1023, unit: 'B' });
    expect(splitSize(1536)).toEqual({ value: 1.5, unit: 'KB' });
    expect(splitSize(5 * 1024 ** 2)).toEqual({ value: 5, unit: 'MB' });
    expect(splitSize(3 * 1024 ** 3)).toEqual({ value: 3, unit: 'GB' });
  });
});
