import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Input, VisuallyHidden } from '../../index';
import type { InputProps } from '../../index';

export interface PasswordFieldLabels {
  /** Visible text of the toggle while the password is hidden. */
  show: string;
  /** Visible text of the toggle while the password is visible. */
  hide: string;
  /** Accessible name while hidden. Must contain `show` (WCAG 2.5.3 Label in Name). */
  showPassword: string;
  /** Accessible name while visible. Must contain `hide`. */
  hidePassword: string;
  /** Announced after showing the password. */
  shown: string;
  /** Announced after hiding the password. */
  hidden: string;
}

const DEFAULT_LABELS: PasswordFieldLabels = {
  show: 'Show',
  hide: 'Hide',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  shown: 'Password shown',
  hidden: 'Password hidden',
};

export interface PasswordFieldProps extends Omit<
  Extract<InputProps, { label: ReactNode }>,
  'type' | 'trailing' | 'autoComplete' | 'label'
> {
  /** Label of the field. */
  label?: string;
  /**
   * `current` for signing in (`autoComplete="current-password"`), `new` for creating or changing
   * a password (`autoComplete="new-password"`), which also lets a password manager offer a
   * generated one.
   */
  mode?: 'current' | 'new';
  /** Strings of the toggle, so they can be translated. */
  labels?: Partial<PasswordFieldLabels>;
}

/**
 * A password field with a show/hide toggle. The toggle is a labelled `Button` inside the field,
 * after the text; it never leaves the tab order, so keyboard and switch users can use it.
 *
 * Accessible authentication (WCAG 3.3.8): the field keeps pasting and password managers working.
 * It sets `autoComplete` to `current-password` or `new-password`, never `off`, and it blocks
 * nothing: no `onPaste` handler, no `autoComplete="off"`, no "type it, do not paste it" rule.
 */
export function PasswordField({
  label = 'Password',
  mode = 'current',
  labels,
  ...rest
}: PasswordFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [visible, setVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  function toggle() {
    const next = !visible;
    setVisible(next);
    setAnnouncement(next ? text.shown : text.hidden);
  }

  return (
    <>
      <Input
        {...rest}
        label={label}
        type={visible ? 'text' : 'password'}
        autoComplete={mode === 'new' ? 'new-password' : 'current-password'}
        // Passwords are not words: no spell checking.
        spellCheck="false"
        trailing={
          <Button
            size="sm"
            variant="ghost"
            aria-label={visible ? text.hidePassword : text.showPassword}
            isDisabled={rest.isDisabled === true}
            onPress={toggle}
          >
            {visible ? text.hide : text.show}
          </Button>
        }
      />
      <VisuallyHidden role="status">{announcement}</VisuallyHidden>
    </>
  );
}
