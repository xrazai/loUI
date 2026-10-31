import rule from '../src/rules/icon-button-label.js';
import { createTester, ds, tsx } from './helpers.js';

createTester().run('icon-button-label', rule, {
  valid: [
    { ...tsx, code: ds(`const a = <IconButton label="Add order" icon={PlusIcon} />;`) },
    { ...tsx, code: ds(`const a = <IconButton label={t.add} icon={PlusIcon} />;`) },
    { ...tsx, code: ds(`const a = <IconButton {...props} icon={PlusIcon} />;`) },
    { ...tsx, code: ds(`const a = <button aria-label="Close"><Icon icon={XIcon} /></button>;`) },
    { ...tsx, code: ds(`const a = <Button aria-labelledby="x"><Icon icon={XIcon} /></Button>;`) },
    { ...tsx, code: ds(`const a = <Button><Icon icon={XIcon} /> Close</Button>;`) },
    { ...tsx, code: ds(`const a = <Button><Icon icon={XIcon} /><span>Close</span></Button>;`) },
    { ...tsx, code: ds(`const a = <Button><Icon icon={XIcon} label="Close" /></Button>;`) },
    { ...tsx, code: ds(`const a = <Button>Save</Button>;`) },
    { ...tsx, code: ds(`const a = <Card><Icon icon={XIcon} /></Card>;`) },
  ],
  invalid: [
    {
      ...tsx,
      code: ds(`const a = <IconButton icon={PlusIcon} />;`),
      errors: [{ messageId: 'missingLabel' }],
    },
    {
      ...tsx,
      code: ds(`const a = <IconButton label="" icon={PlusIcon} />;`),
      errors: [{ messageId: 'missingLabel' }],
    },
    // JS users without imports from the DS: the local name is enough for IconButton.
    {
      ...tsx,
      code: `const a = <IconButton icon={Plus} />;`,
      errors: [{ messageId: 'missingLabel' }],
    },
    {
      ...tsx,
      code: ds(`const a = <button><Icon icon={XIcon} /></button>;`),
      errors: [{ messageId: 'iconOnly' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button variant="ghost"><Icon icon={XIcon} /></Button>;`),
      errors: [{ messageId: 'iconOnly' }],
    },
    {
      ...tsx,
      code: ds(`const a = <button>\n  <PlusIcon />\n</button>;`),
      errors: [{ messageId: 'iconOnly' }],
    },
  ],
});
