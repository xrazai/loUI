import rule from '../src/rules/one-primary-action.js';
import { createTester, ds, tsx } from './helpers.js';

createTester().run('one-primary-action', rule, {
  valid: [
    {
      ...tsx,
      code: ds(
        `const A = () => <div><Button variant="primary">Save</Button><Button>Cancel</Button></div>;`,
      ),
    },
    { ...tsx, code: ds(`const A = () => <Button variant="primary">Save</Button>;`) },
    // Mutually exclusive branches.
    {
      ...tsx,
      code: ds(
        `const A = ({ busy }) => busy ? <Button variant="primary">Stop</Button> : <Button variant="primary">Run</Button>;`,
      ),
    },
    {
      ...tsx,
      code: ds(
        `function A({ x }) { if (x) { return <Button variant="primary">A</Button>; } return <Button variant="primary">B</Button>; }`,
      ),
    },
    // A dialog is its own layer.
    {
      ...tsx,
      code: ds(
        `const A = () => <div><Button variant="primary">Open</Button><Dialog><Button variant="primary">Confirm</Button></Dialog></div>;`,
      ),
    },
    // Separate component functions.
    {
      ...tsx,
      code: ds(
        `const A = () => <Button variant="primary">A</Button>; const B = () => <Button variant="primary">B</Button>;`,
      ),
    },
    // Not the design system Button.
    {
      ...tsx,
      code: `const A = () => <div><Button variant="primary" /><Button variant="primary" /></div>;`,
    },
    // Dynamic variant is unknown.
    {
      ...tsx,
      code: ds(
        `const A = ({ v }) => <div><Button variant={v}>A</Button><Button variant="primary">B</Button></div>;`,
      ),
    },
    {
      ...tsx,
      code: ds(
        `const A = () => <div><Button variant="primary">A</Button><Button variant="primary">B</Button></div>;`,
      ),
      options: [{ max: 2 }],
    },
  ],
  invalid: [
    {
      ...tsx,
      code: ds(
        `const A = () => <div><Button variant="primary">A</Button><Button variant="primary">B</Button></div>;`,
      ),
      errors: [{ messageId: 'many', line: 2 }],
    },
    {
      ...tsx,
      code: ds(
        `function A() { return <div><Button variant={'primary'}>A</Button><Button variant="primary">B</Button><Button variant="primary">C</Button></div>; }`,
      ),
      errors: 2,
    },
    {
      ...tsx,
      code: `import * as DS from 'loui-ds';\nconst A = () => <div><DS.Button variant="primary">A</DS.Button><DS.Button variant="primary">B</DS.Button></div>;`,
      errors: 1,
    },
    {
      ...tsx,
      code: ds(
        `const A = ({ a }) => <div>{a ? <Button variant="primary">A</Button> : null}<Button variant="primary">B</Button></div>;`,
      ),
      errors: 1,
    },
  ],
});
