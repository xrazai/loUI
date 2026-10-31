/** Why a file was not added. */
export type FileRejectionReason = 'type' | 'size' | 'count';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileRules {
  /** Accepted types: MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`). Empty or missing accepts all. */
  accept?: readonly string[] | undefined;
  /** Largest file in bytes. */
  maxSize?: number | undefined;
  /** Most files in the list. */
  maxFiles?: number | undefined;
}

/** True when `file` matches one entry of `accept` (case-insensitive). */
export function matchesAccept(file: File, accept: readonly string[] | undefined): boolean {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (rule === '') return false;
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export interface ValidationResult {
  accepted: File[];
  rejected: FileRejection[];
}

/**
 * Splits `incoming` files into those that can join `current` and those that cannot, in order:
 * a wrong type or an oversized file is rejected on its own; files beyond `maxFiles` are rejected
 * with `count`. With `maxFiles === 1` a new file replaces the current one instead of failing.
 */
export function validateFiles(
  current: readonly File[],
  incoming: readonly File[],
  rules: FileRules,
): ValidationResult {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  const replaces = rules.maxFiles === 1;
  const base = replaces ? [] : [...current];
  for (const file of incoming) {
    if (!matchesAccept(file, rules.accept)) {
      rejected.push({ file, reason: 'type' });
    } else if (rules.maxSize !== undefined && file.size > rules.maxSize) {
      rejected.push({ file, reason: 'size' });
    } else if (rules.maxFiles !== undefined && base.length + accepted.length >= rules.maxFiles) {
      rejected.push({ file, reason: 'count' });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}

export type SizeUnit = 'B' | 'KB' | 'MB' | 'GB';

/** Picks the unit and the value for a byte count (1 KB is 1024 bytes). */
export function splitSize(bytes: number): { value: number; unit: SizeUnit } {
  if (bytes < 1024) return { value: bytes, unit: 'B' };
  if (bytes < 1024 ** 2) return { value: bytes / 1024, unit: 'KB' };
  if (bytes < 1024 ** 3) return { value: bytes / 1024 ** 2, unit: 'MB' };
  return { value: bytes / 1024 ** 3, unit: 'GB' };
}
