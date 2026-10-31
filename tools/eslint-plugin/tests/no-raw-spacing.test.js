import rule from '../src/rules/no-raw-spacing.js';
import { createTester, tsx } from './helpers.js';

createTester().run('no-raw-spacing', rule, {
  valid: [
    { ...tsx, code: `const a = <div style={{ gap: 'var(--ds-space-4)' }} />;` },
    { ...tsx, code: `const a = <div style={{ margin: 0, padding: '0' }} />;` },
    { ...tsx, code: `const a = <div style={{ margin: '0px' }} />;` },
    {
      ...tsx,
      code: `const a = <div style={{ width: '100%', maxWidth: 'min(100%, var(--ds-size-content))' }} />;`,
    },
    { ...tsx, code: `const a = <div style={{ padding: 'calc(var(--ds-space-2) * 2)' }} />;` },
    { ...tsx, code: `const a = <div style={{ lineHeight: 1.5, opacity: 0.5, flex: 1 }} />;` },
    { ...tsx, code: `const a = <div style={{ fontSize: '14px' }} />;` },
    { ...tsx, code: `const a = <div style={{ '--ds-card-pad': '16px' }} />;` },
    {
      ...tsx,
      code: `const a = <div style={{ maxWidth: 520 }} />;`,
      options: [{ ignoreProperties: ['maxWidth'] }],
    },
    { ...tsx, code: `const a = <div style={{ gap: size }} />;` },
  ],
  invalid: [
    {
      ...tsx,
      code: `const a = <div style={{ gap: 12 }} />;`,
      errors: [{ messageId: 'raw', data: { value: '12px', property: 'gap' } }],
    },
    {
      ...tsx,
      code: `const a = <div style={{ margin: '8px 0' }} />;`,
      errors: [{ messageId: 'raw', data: { value: '8px', property: 'margin' } }],
    },
    { ...tsx, code: `const a = <div style={{ paddingInline: '1rem' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ paddingBlockStart: '0.5em' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ maxInlineSize: 520 }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ width: '320px' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ minHeight: 40 }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ marginTop: -4 }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ width: 'calc(100% - 16px)' }} />;`, errors: 1 },
    {
      ...tsx,
      code: `const a = <div style={{ top: 8 }} />;`,
      options: [{ extraProperties: ['top'] }],
      errors: 1,
    },
    { ...tsx, code: `const a = <div style={{ rowGap: 4, columnGap: 8 }} />;`, errors: 2 },
  ],
});
