import rule from '../src/rules/no-raw-colors.js';
import { createTester, ds, tsx } from './helpers.js';

createTester().run('no-raw-colors', rule, {
  valid: [
    { ...tsx, code: `const a = <div style={{ color: 'var(--ds-color-text)' }} />;` },
    {
      ...tsx,
      code: `const a = <div style={{ background: 'transparent', color: 'currentColor' }} />;`,
    },
    { ...tsx, code: `const a = <svg fill="currentColor" stroke="none" />;` },
    { ...tsx, code: `const a = <div style={{ '--ds-card-bg': 'var(--ds-color-surface)' }} />;` },
    { ...tsx, code: `const a = <div style={{ content: 'red', display: 'flex' }} />;` },
    { ...tsx, code: `const a = <svg fill="url(#abc)" />;` },
    { ...tsx, code: `const a = <div className="bg-surface text-primary" />;` },
    {
      ...tsx,
      code: `const a = <div style={{ color: '#000' }} />;`,
      options: [{ allow: ['#000'] }],
    },
    { ...tsx, code: `const a = <div style={{ color: 'red' }} />;`, options: [{ named: false }] },
    { ...tsx, code: `const a = css\`color: var(--ds-color-text);\`;` },
    { ...tsx, code: `const a = <div style={style} />;` },
    // `color` is data on a design system component, not paint.
    { ...tsx, code: ds(`const a = <Swatch color="#1f3a93" />;`) },
  ],
  invalid: [
    {
      ...tsx,
      code: `const a = <div style={{ color: '#fff' }} />;`,
      errors: [{ messageId: 'raw', data: { value: '#fff', where: 'the style prop (color)' } }],
    },
    { ...tsx, code: `const a = <div style={{ background: '#1a1a1aff' }} />;`, errors: 1 },
    {
      ...tsx,
      code: `const a = <div style={{ backgroundColor: 'rgb(0 0 0 / 50%)' }} />;`,
      errors: 1,
    },
    { ...tsx, code: `const a = <div style={{ borderColor: 'hsl(10, 20%, 30%)' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ color: 'red' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <div style={{ border: '1px solid white' }} />;`, errors: 1 },
    {
      ...tsx,
      code: `const a = <div style={{ boxShadow: '0 0 4px rgba(0,0,0,.4)' }} />;`,
      errors: 1,
    },
    {
      ...tsx,
      code: `const a = <div style={{ color: on ? '#fff' : 'var(--ds-color-text)' }} />;`,
      errors: 1,
    },
    {
      ...tsx,
      code: `const a = <div style={{ color: 'var(--ds-color-text, #fff)' }} />;`,
      errors: 1,
    },
    { ...tsx, code: `const a = <div style={{ '--ds-card-bg': '#222' }} />;`, errors: 1 },
    { ...tsx, code: `const a = <svg fill="#ff0000" />;`, errors: 1 },
    { ...tsx, code: `const a = <path stroke="blue" />;`, errors: 1 },
    {
      ...tsx,
      code: `const a = <div className="bg-[#fff] p-2" />;`,
      errors: [{ messageId: 'raw', data: { value: '#fff', where: 'className' } }],
    },
    {
      ...tsx,
      code: `const a = <div className={cn('text-[rgb(0,0,0)]', x && 'p-2')} />;`,
      errors: 1,
    },
    {
      ...tsx,
      code: `const Box = styled.div\`color: #fff;\`;`,
      errors: [{ messageId: 'raw', data: { value: '#fff', where: 'a styled string' } }],
    },
    { ...tsx, code: `const Box = styled(Card)\`background: rgb(1, 2, 3);\`;`, errors: 1 },
    { ...tsx, code: `const k = keyframes\`from { color: #000 }\`;`, errors: 1 },
  ],
});
