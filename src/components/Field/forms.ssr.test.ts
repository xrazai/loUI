// @vitest-environment node
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DSProvider } from '../../providers/DSProvider';
import { Checkbox, CheckboxGroup } from '../Checkbox';
import { Input } from '../Input';
import { Radio, RadioGroup } from '../RadioGroup';
import { Select } from '../Select';
import { Switch } from '../Switch';
import { Textarea } from '../Textarea';

/** SSR safety of every form field: render on the server without `window` or `document`. */
function html(element: ReturnType<typeof createElement>): string {
  return renderToString(createElement(DSProvider, null, element));
}

describe('form fields render on the server', () => {
  it('Input renders label, input and description', () => {
    const out = html(
      createElement(Input, { label: 'Name', description: 'Shown on invoices.', isRequired: true }),
    );
    expect(out).toContain('Name');
    expect(out).toContain('<input');
    expect(out).toContain('Shown on invoices.');
    expect(out).toContain('required');
  });

  it('Textarea renders with a counter and aside', () => {
    const out = html(
      createElement(Textarea, {
        label: 'Notes',
        aside: 'Optional',
        maxLength: 20,
        showCount: true,
      }),
    );
    expect(out).toContain('<textarea');
    expect(out).toContain('Optional');
    expect(out).toContain('0 / 20');
  });

  it('Select renders the placeholder and a hidden native select', () => {
    const out = html(
      createElement(Select, {
        label: 'Region',
        name: 'region',
        options: [{ value: 'a', label: 'A' }],
      }),
    );
    expect(out).toContain('Select an option');
    expect(out).toContain('<select');
  });

  it('Checkbox, CheckboxGroup, RadioGroup and Switch render', () => {
    expect(html(createElement(Checkbox, { label: 'Agree', description: 'Please.' }))).toContain(
      'type="checkbox"',
    );
    expect(
      html(
        createElement(CheckboxGroup, {
          label: 'Topics',
          children: createElement(Checkbox, { value: 'a', label: 'A' }),
        }),
      ),
    ).toContain('role="group"');
    expect(
      html(
        createElement(RadioGroup, {
          label: 'Region',
          children: createElement(Radio, { value: 'a', label: 'A' }),
        }),
      ),
    ).toContain('role="radiogroup"');
    expect(html(createElement(Switch, { label: 'Alerts' }))).toContain('role="switch"');
  });
});
