import type { ReactNode, Ref } from 'react';
import { ColorField as RACColorField, Input as RACInput } from 'react-aria-components';
import type { ColorFieldProps as RACColorFieldProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label } from '../Field';
import type {
  FieldErrorMessage,
  FieldLabelingProps,
  FieldMessageTone,
  fieldMessages,
} from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Swatch } from '../Swatch';
import { messages } from './ColorField.messages';
import styles from './ColorField.module.css';

export type ColorFieldSize = 'sm' | 'md' | 'lg';

export type ColorFieldMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface ColorFieldBaseProps extends Omit<
  RACColorFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby' | 'render' | 'channel'
> {
  /** Helper text under the control, linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check.
   * The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /**
   * Error text, shown while the field is invalid and the error is displayed (see `Input`).
   * Defaults to the catalog message "Enter a colour as #RRGGBB.".
   */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the field is empty, for example `#RRGGBB`. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: ColorFieldSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance: `invalid`, `requiredMark`. */
  messages?: ColorFieldMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type ColorFieldProps = ColorFieldBaseProps & FieldLabelingProps;

/**
 * A hex colour field: a text input in Geist Mono with a `Swatch` preview of the current colour,
 * built on React Aria `ColorField`. Type `#abc` or `aabbcc` and the value is normalised to
 * `#AABBCC` on blur or `Enter`; text that is not a colour is reverted on blur. `ArrowUp` /
 * `ArrowDown` step the value by one.
 *
 * `value` / `defaultValue` accept a `#RRGGBB` string or a React Aria `Color`; `onChange`
 * receives a `Color` or `null` when the field is empty. Read the hex with
 * `color?.toString('hex')` (always `#RRGGBB`, upper case). The swatch is decorative: the
 * hex text next to it names the colour. A picker (area and sliders) is not part of this component.
 */
export function ColorField({
  label,
  description,
  descriptionTone,
  errorMessage,
  placeholder,
  size = 'md',
  fullWidth = false,
  className,
  inputClassName,
  inputRef,
  messages: messageOverrides,
  ref,
  ...rest
}: ColorFieldProps) {
  warnMissingName('ColorField', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('ColorField', messages, messageOverrides);
  return (
    <RACColorField
      {...rest}
      ref={ref}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={classNames(fieldStyles.root, styles.field, className)}
    >
      {({ state }) => {
        const hex = state.colorValue ? state.colorValue.toString('hex') : undefined;
        return (
          <>
            {label ? (
              <Label isRequired={rest.isRequired} messages={messageOverrides}>
                {label}
              </Label>
            ) : null}
            <div className={classNames(fieldStyles.control, fieldStyles.row)}>
              <span className={styles.preview}>
                <Swatch decorative color={hex} size={size === 'sm' ? 'sm' : 'md'} />
              </span>
              <RACInput
                ref={inputRef}
                {...(placeholder === undefined ? {} : { placeholder })}
                className={classNames(styles.input, inputClassName)}
              />
            </div>
            <FieldMessages
              description={description}
              descriptionTone={descriptionTone}
              errorMessage={errorMessage ?? t.invalid}
            />
          </>
        );
      }}
    </RACColorField>
  );
}
