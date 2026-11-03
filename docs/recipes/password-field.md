# PasswordField

Status: experimental

A password field with a show/hide toggle, built from `Input` and a labelled `Button` in its `trailing` slot. It satisfies WCAG 3.3.8 (accessible authentication): pasting and password managers keep working, and nothing asks the user to remember or retype a password.

Components: `Input`, `Button`, `VisuallyHidden`.

## When to use

- Sign-in, sign-up and change-password forms.
- Any secret the user types that a typo would make hard to correct: API keys, access tokens.

## When not to use

- A PIN or one-time code: use `Input` with `inputMode="numeric"` and `autoComplete="one-time-code"`.
- Confirming a password by typing it twice: do not add a second field. The toggle lets the user check what they typed, and a second field defeats password managers.

## What it does

1. The field is `type="password"` and the toggle sits inside it, after the text. The toggle is a real button in the tab order, so keyboard and switch users can reach it. Enter and Space press it.
2. The toggle's visible text and its accessible name change together: "Show" with the name "Show password", then "Hide" with "Hide password". The name contains the visible text (WCAG 2.5.3, Label in Name).
3. A visually hidden `role="status"` announces "Password shown" or "Password hidden". Focus stays on the toggle, and the typed value is kept.
4. `mode="current"` sets `autoComplete="current-password"` (sign-in). `mode="new"` sets `autoComplete="new-password"` (sign-up, change password), which also lets the password manager offer a generated password.

## Why not `autoComplete="off"`

`off` on a password field tells password managers and the browser not to help. Browsers mostly ignore it for login forms, and where they obey it the user is pushed towards a weak, memorable password or to retyping one. WCAG 3.3.8 asks for the opposite: let the user paste and use a manager. Use `current-password` or `new-password`, always.

## Why not `aria-pressed`

The toggle changes its name ("Show password" / "Hide password"), so its state is already in the name. A button whose name changes **and** has `aria-pressed` reads as "Hide password, pressed", which is ambiguous. Use one of the two: a changing name (this recipe), or a fixed name ("Show password") with `aria-pressed={visible}` and no visible text swap.

## Things to keep when you adapt it

- Never add an `onPaste` handler that blocks, `autoComplete="off"`, or any rule that forbids pasting.
- Keep `spellCheck="false"`; a password is not a word.
- Pass translated strings through `labels`; each pair (visible text and name) must stay consistent, with the visible text inside the name.
- Do not hide the password again automatically in a way that moves focus or clears the value.
- Show the password rule in `description` (not in a placeholder) when you create a password, and put server errors in `errorMessage`.

## Code

<!-- recipe-source:start -->

```tsx
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
```

<!-- recipe-source:end -->
