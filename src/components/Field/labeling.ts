import type { ReactNode } from 'react';
import { isDev } from '../../utils/env';

/**
 * Every field needs an accessible name: a visible `label`, or `aria-label`, or `aria-labelledby`.
 * Intersect this type with the component props so that omitting all three is a type error.
 */
export type FieldLabelingProps =
  | {
      /** Visible label. Prefer it: sighted and assistive technology users see the same name. */
      label: ReactNode;
      'aria-label'?: string;
      'aria-labelledby'?: string;
    }
  | {
      label?: undefined;
      /** Accessible name when there is no visible label (for example a search box with an icon). */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      label?: undefined;
      'aria-label'?: string;
      /** Id of the element that names the field. */
      'aria-labelledby': string;
    };

/**
 * Selects the variant of a props type that has a visible `label`. Use it to type stories:
 * `Meta<WithLabel<InputProps>>` (a union of naming options confuses Storybook's required-args logic).
 */
export type WithLabel<P> = Extract<P, { label: ReactNode }>;

/**
 * Tone of a field's description (GAP-039): `neutral` is the plain helper text; `accent`,
 * `success`, `warning` and `danger` tint it for a live check ("Matches", "Over by $5").
 * Colour only reinforces: the words must carry the meaning on their own.
 */
export type FieldMessageTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** The subset of RAC's `ValidationResult` passed to an `errorMessage` function. */
export interface FieldValidation {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: ValidityState;
}

/** Error message of a field: a node, or a function that receives the validation result. */
export type FieldErrorMessage = ReactNode | ((validation: FieldValidation) => ReactNode);

const warned = new Set<string>();

/**
 * Development-only safety net for consumers that bypass the types: warns once per component
 * when a field has no accessible name.
 */
export function warnMissingName(
  component: string,
  props: {
    label?: ReactNode;
    'aria-label'?: string | undefined;
    'aria-labelledby'?: string | undefined;
  },
): void {
  if (!isDev() || warned.has(component)) return;
  const hasName =
    Boolean(props.label) || Boolean(props['aria-label']) || Boolean(props['aria-labelledby']);
  if (hasName) return;
  warned.add(component);
  console.warn(
    `[loui-ds] ${component} needs an accessible name: pass \`label\`, \`aria-label\` or \`aria-labelledby\`.`,
  );
}

/** Test helper: forgets which components were already reported. Not part of the public API. */
export function resetMissingNameWarnings(): void {
  warned.clear();
}
