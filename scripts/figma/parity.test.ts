// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  booleanProperties,
  buildParityMarkdown,
  figmaPath,
  figmaPropertyName,
  figmaValue,
  variantProperties,
} from './parity';

const button = {
  name: 'Button',
  status: 'stable',
  stories: { title: 'Components/Button' },
  props: [
    { name: 'fullWidth', type: 'boolean' },
    { name: 'isDisabled', type: 'boolean' },
    { name: 'isPending', type: 'boolean' },
    { name: 'isOld', type: 'boolean', deprecated: 'Use isPending.' },
    { name: 'onPress', type: '(e: PressEvent) => void' },
  ],
  variants: { variant: ['primary', 'danger-solid'], size: ['sm', 'md', 'lg'] },
};

describe('Figma parity (REL-005)', () => {
  it('names properties and values in sentence case', () => {
    expect(figmaPropertyName('isReadOnly')).toBe('Read only');
    expect(figmaPropertyName('fullWidth')).toBe('Full width');
    expect(figmaPropertyName('variant')).toBe('Variant');
    expect(figmaValue('danger-solid')).toBe('Danger solid');
  });

  it('derives the Figma path and variant properties from the manifest entry', () => {
    expect(figmaPath(button)).toBe('Components/Button');
    expect(variantProperties(button)).toEqual([
      'Variant = Primary / Danger solid',
      'Size = sm / md / lg',
    ]);
  });

  it('turns state booleans into boolean properties and skips deprecated and plumbing props', () => {
    expect(booleanProperties(button)).toEqual(['Full width', 'Pending']);
  });

  it('renders a sorted table', () => {
    const md = buildParityMarkdown([{ ...button, name: 'Zed' }, button]);
    expect(md.indexOf('`Button`')).toBeLessThan(md.indexOf('`Zed`'));
    expect(md).toContain('| `Button` | `Components/Button` |');
  });
});
