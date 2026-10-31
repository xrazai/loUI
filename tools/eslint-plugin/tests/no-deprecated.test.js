import rule from '../src/rules/no-deprecated.js';
import { createTester, ds, tsx } from './helpers.js';

createTester().run('no-deprecated', rule, {
  valid: [
    { ...tsx, code: ds(`const a = <Button variant="primary">Save</Button>;`) },
    // Same name, not from the design system.
    { ...tsx, code: `const a = <OldBanner />;` },
    { ...tsx, code: `import { OldBanner } from 'other-lib';\nconst a = <OldBanner />;` },
    { ...tsx, code: ds(`const a = <Card />;`) },
  ],
  invalid: [
    {
      ...tsx,
      code: ds(`const a = <OldBanner />;`),
      errors: [{ messageId: 'component', data: { name: 'OldBanner', hint: '' } }],
    },
    {
      ...tsx,
      code: `import { OldBanner as Banner } from '@loui/ds';\nconst a = <Banner />;`,
      errors: 1,
    },
    {
      ...tsx,
      code: ds(`const a = <Button legacyTone="x">Save</Button>;`),
      errors: [
        { messageId: 'prop', data: { name: 'Button', prop: 'legacyTone', hint: ' Use variant.' } },
      ],
    },
    {
      ...tsx,
      code: ds(`const a = <Alert title="Hi">Body</Alert>;`),
      errors: [
        { messageId: 'prop', data: { name: 'Alert', prop: 'title', hint: ' Use heading.' } },
      ],
    },
    {
      ...tsx,
      code: ds(`const a = <Card />;`),
      options: [{ deprecatedComponents: { Card: 'Use Panel.' } }],
      errors: [{ messageId: 'component', data: { name: 'Card', hint: ' Use Panel.' } }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button size="sm">Save</Button>;`),
      options: [{ deprecatedProps: { 'Button.size': 'Use density.' } }],
      errors: 1,
    },
    // Components resolved by relative import (the DS repo's own stories).
    {
      ...tsx,
      code: `import { OldBanner } from './OldBanner';\nconst a = <OldBanner />;`,
      errors: 1,
    },
  ],
});

// Graceful fallback: no manifest means nothing to check, never a crash.
createTester().run('no-deprecated (no manifest)', rule, {
  valid: [
    {
      ...tsx,
      code: `import { OldBanner } from '@loui/ds';\nconst a = <OldBanner />;`,
      settings: { loui: { manifest: { components: [] }, packages: ['@loui/ds'] } },
    },
  ],
  invalid: [],
});
