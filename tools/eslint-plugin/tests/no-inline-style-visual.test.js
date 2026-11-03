import rule from '../src/rules/no-inline-style-visual.js';
import { createTester, ds, tsx } from './helpers.js';

createTester().run('no-inline-style-visual', rule, {
  valid: [
    { ...tsx, code: ds(`const a = <Card style={{ '--ds-card-pad': 'var(--ds-space-4)' }} />;`) },
    { ...tsx, code: ds(`const a = <Card style={{ ['--ds-progress-value']: 0.4 }} />;`) },
    { ...tsx, code: ds(`const a = <Card style={style} />;`) },
    { ...tsx, code: ds(`const a = <Card style={{ ...base, '--ds-card-pad': pad }} />;`) },
    // Plain DOM elements are the app's business (see no-raw-colors / no-raw-spacing).
    { ...tsx, code: ds(`const a = <div style={{ color: 'red' }} />;`) },
    { ...tsx, code: `const a = <Card style={{ color: 'red' }} />;` },
    {
      ...tsx,
      code: ds(`const a = <Card style={{ width: 200 }} />;`),
      options: [{ allowProperties: ['width'] }],
    },
  ],
  invalid: [
    {
      ...tsx,
      code: ds(`const a = <Card style={{ background: 'red' }} />;`),
      errors: [{ messageId: 'visual', data: { component: 'Card', property: 'background' } }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button style={{ padding: 8, color: 'x' }}>Save</Button>;`),
      errors: 2,
    },
    { ...tsx, code: ds(`const a = <Card style={{ 'background-color': 'x' }} />;`), errors: 1 },
    {
      ...tsx,
      code: `import * as DS from 'loui-ds';\nconst a = <DS.Card style={{ margin: 0 }} />;`,
      errors: 1,
    },
    {
      ...tsx,
      code: ds(`const a = <Card style={{ '--brand-pad': '1' }} />;`),
      options: [{ customPropertyPrefix: '--ds-' }],
      errors: [{ messageId: 'prefix' }],
    },
  ],
});
