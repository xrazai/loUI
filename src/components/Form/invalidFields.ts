/** One invalid field as the error summary shows it. */
export interface InvalidField {
  /** The control (the first radio or checkbox of a group) that the link focuses. */
  element: HTMLElement;
  /** Id of the control, used for the link `href`. Empty when the control has no id. */
  id: string;
  /** The field's label. */
  label: string;
  /** The error message, when one is rendered. */
  message: string;
}

const CONTROLS = 'input, select, textarea';
const GROUPS = '[role="radiogroup"], [role="group"]';

/** Text content without the parts hidden from assistive technology (the required marker "*"). */
function visibleText(element: Element | null | undefined): string {
  if (!element) return '';
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return clone.textContent.trim();
}

function textOf(ids: string | null, root: Document): string {
  if (!ids) return '';
  return ids
    .split(/\s+/)
    .map((id) => visibleText(root.getElementById(id)))
    .filter(Boolean)
    .join(' ');
}

function labelOf(control: HTMLElement, root: Document): string {
  const group = control.closest<HTMLElement>(GROUPS);
  if (
    group &&
    control instanceof HTMLInputElement &&
    (control.type === 'radio' || control.type === 'checkbox') &&
    (group.getAttribute('aria-labelledby') ?? group.getAttribute('aria-label'))
  ) {
    return group.getAttribute('aria-label') ?? textOf(group.getAttribute('aria-labelledby'), root);
  }
  const labels = (control as HTMLInputElement).labels;
  const fromLabel = visibleText(labels?.[0]);
  return (
    fromLabel ||
    control.getAttribute('aria-label') ||
    textOf(control.getAttribute('aria-labelledby'), root) ||
    control.getAttribute('name') ||
    ''
  );
}

/** The visible error text of a field: the alert rendered by its `FieldError`, else the browser's message. */
function messageOf(control: HTMLElement): string {
  // React Aria puts `data-invalid` on the control too: start from its parent to find the field root.
  const field = control.parentElement?.closest('[data-invalid]');
  const alert = field?.querySelector('[role="alert"]');
  return visibleText(alert) || (control as HTMLInputElement).validationMessage;
}

/**
 * Finds the invalid fields of a form: controls the browser considers invalid (`:invalid`, native
 * validation) or that a field marked `aria-invalid="true"` (server errors, `aria` behavior).
 * Radio and checkbox groups count once, under the group's label.
 */
export function collectInvalidFields(form: HTMLFormElement): InvalidField[] {
  const root = form.ownerDocument;
  const seen = new Set<Element>();
  const fields: InvalidField[] = [];
  for (const control of form.querySelectorAll<HTMLElement>(CONTROLS)) {
    const element = control as HTMLInputElement;
    // Only errors the user can see: a required field is `:invalid` from the start, but React
    // Aria marks the field (`data-invalid`) only once the error is displayed.
    const displayed =
      control.getAttribute('aria-invalid') === 'true' || control.closest('[data-invalid]') !== null;
    const invalid =
      control.getAttribute('aria-invalid') === 'true' ||
      (typeof element.willValidate === 'boolean' &&
        element.willValidate &&
        !element.validity.valid);
    if (!displayed || !invalid) continue;
    const isChoice =
      element instanceof HTMLInputElement && ['radio', 'checkbox'].includes(element.type);
    const group = isChoice ? control.closest<HTMLElement>(GROUPS) : null;
    const key = group ?? control;
    if (seen.has(key)) continue;
    seen.add(key);
    fields.push({
      element: control,
      id: control.id,
      label: labelOf(control, root),
      message: messageOf(control),
    });
  }
  return fields;
}
