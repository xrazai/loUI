import rule from '../src/rules/allowed-icons.js';
import { createTester, tsx } from './helpers.js';

createTester().run('allowed-icons', rule, {
  valid: [
    { ...tsx, code: `import { PlusIcon } from 'loui-ds';` },
    { ...tsx, code: `import type { LucideIcon } from 'lucide-react';` },
    { ...tsx, code: `import { type LucideIcon } from 'lucide-react';` },
    { ...tsx, code: `import { Plus } from 'lucide-react';`, options: [{ allow: ['Plus'] }] },
    { ...tsx, code: `import { Plus } from 'other-icons';` },
  ],
  invalid: [
    {
      ...tsx,
      code: `import { Plus } from 'lucide-react';`,
      errors: [
        { messageId: 'useCurated', data: { name: 'Plus', curated: 'PlusIcon', from: 'loui-ds' } },
      ],
    },
    {
      ...tsx,
      code: `import { PlusIcon } from 'lucide-react';`,
      errors: [{ messageId: 'useCurated' }],
    },
    {
      ...tsx,
      code: `import { LoaderCircle, Search as S } from 'lucide-react';`,
      errors: [{ messageId: 'useCurated' }, { messageId: 'useCurated' }],
    },
    {
      ...tsx,
      code: `import { Truck } from 'lucide-react';`,
      errors: [{ messageId: 'notCurated', data: { name: 'Truck', curated: '', from: 'loui-ds' } }],
    },
    {
      ...tsx,
      code: `import { Truck } from 'lucide-react/dynamic';`,
      errors: [{ messageId: 'notCurated' }],
    },
    {
      ...tsx,
      code: `import * as Lucide from 'lucide-react';`,
      errors: [{ messageId: 'namespace' }],
    },
    {
      ...tsx,
      code: `import Truck from 'lucide-react/icons/truck';`,
      errors: [{ messageId: 'notCurated' }],
    },
  ],
});
