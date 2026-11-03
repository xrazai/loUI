import { useId } from 'react';
import type { ReactNode, Ref } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import type { ToggleButtonGroupProps } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { useDSLocale } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import type { FieldLabelingProps, FieldMessageTone } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './SegmentedControl.module.css';

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlOption {
  /** Value reported by `onChange` and matched by `value` / `defaultValue`. Unique in the control. */
  value: string;
  /** Visible label: a short noun or adjective in sentence case ("Open"). */
  label: string;
  /** Optional count after the label. Numbers are formatted for the active locale. */
  count?: number | string;
  /**
   * Accessible text for the count ("3 open"). Without it the visible count is read as part of
   * the option's name.
   */
  countLabel?: string;
  /** Disables this option. */
  isDisabled?: boolean;
}

interface SegmentedControlBaseProps extends Omit<
  ToggleButtonGroupProps,
  | 'className'
  | 'style'
  | 'children'
  | 'selectionMode'
  | 'selectedKeys'
  | 'defaultSelectedKeys'
  | 'onSelectionChange'
  | 'disallowEmptySelection'
  | 'orientation'
  | 'aria-label'
  | 'aria-labelledby'
> {
  /** The options, in display order. Two to five fit comfortably. */
  options: readonly SegmentedControlOption[];
  /** Selected option (controlled). */
  value?: string;
  /** Initially selected option (uncontrolled). Defaults to the first enabled option. */
  defaultValue?: string;
  /** Called with the new value when the user selects another option. */
  onChange?: (value: string) => void;
  /**
   * Helper text under the bar, linked to the group with `aria-describedby`. It can hold a
   * `Kbd` to show the shortcuts of the options (see SegmentedControl.md).
   */
  description?: ReactNode;
  /** Tone of the description, same as on `Input`: the text carries the meaning. */
  descriptionTone?: FieldMessageTone | undefined;
  /** Height of the segments: `sm` 24px, `md` 32px (default). */
  size?: SegmentedControlSize;
  /**
   * Stretch to the container; the segments share the width equally. Without it the bar is as
   * wide as its options, also inside a `Stack` (which stretches its children by default).
   */
  fullWidth?: boolean;
  /** Class name for the bar (the group element), also when a `label` or `description` wraps it. */
  className?: string;
  /** Ref to the group element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Name of the group: a visible `label` (preferred, same style as the label of `Input`), or
 * `aria-label`, or `aria-labelledby`. Enforced by the types. A visible `label` wins over
 * `aria-label`, so the name is never doubled.
 */
export type SegmentedControlProps = SegmentedControlBaseProps & FieldLabelingProps;

/**
 * A segmented control picks one value from a few options, like a radio group drawn as a
 * bar. It is a value control: it does not own panels (use `Tabs` for that). Exactly one
 * option is always selected.
 *
 * Built on React Aria `ToggleButtonGroup` with single selection and no empty selection:
 * it is exposed as a radio group, with one tab stop and arrow-key navigation.
 *
 * With `label` and/or `description` the bar is wrapped in a field-like column: the label names
 * the group, the description is linked with `aria-describedby`. Long labels never truncate:
 * when the options are wider than the container the bar scrolls sideways.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  label,
  description,
  descriptionTone,
  size = 'md',
  fullWidth = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SegmentedControlProps) {
  warnMissingName('SegmentedControl', {
    label,
    'aria-label': ariaLabel,
    'aria-labelledby': rest['aria-labelledby'],
  });
  const locale = useDSLocale();
  const labelId = useId();
  const descriptionId = useId();
  const hasLabel = label !== undefined && label !== null && label !== false && label !== '';
  const hasDescription = description !== undefined && description !== null && description !== false;
  const firstEnabled = options.find((option) => option.isDisabled !== true)?.value;
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? firstEnabled ?? '',
    onChange,
  });
  const labelledBy =
    [hasLabel ? labelId : undefined, rest['aria-labelledby']].filter(Boolean).join(' ') ||
    undefined;
  const describedBy =
    [rest['aria-describedby'], hasDescription ? descriptionId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  const group = (
    <ToggleButtonGroup
      {...rest}
      {...(ariaLabel === undefined || hasLabel ? {} : { 'aria-label': ariaLabel })}
      {...(labelledBy === undefined ? {} : { 'aria-labelledby': labelledBy })}
      {...(describedBy === undefined ? {} : { 'aria-describedby': describedBy })}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={current === '' ? [] : [current]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next !== undefined) setCurrent(String(next));
      }}
      className={classNames(styles.root, className)}
      data-size={size}
      data-full-width={fullWidth || undefined}
    >
      {options.map((option) => {
        const hasCount = option.count !== undefined && option.count !== '';
        const visibleCount =
          typeof option.count === 'number' ? formatNumber(option.count, locale) : option.count;
        return (
          <ToggleButton
            key={option.value}
            id={option.value}
            isDisabled={option.isDisabled === true}
            className={classNames(styles.segment)}
          >
            <span>{option.label}</span>
            {hasCount ? (
              <span className={styles.count}>
                <span aria-hidden={option.countLabel === undefined ? undefined : 'true'}>
                  {visibleCount}
                </span>
                {option.countLabel === undefined ? null : (
                  <VisuallyHidden> {option.countLabel}</VisuallyHidden>
                )}
              </span>
            ) : null}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
  if (!hasLabel && !hasDescription) return group;
  const tone = descriptionTone === 'neutral' ? undefined : descriptionTone;
  return (
    <div
      className={classNames(fieldStyles.root, styles.field)}
      data-full-width={fullWidth || undefined}
      data-disabled={rest.isDisabled === true ? 'true' : undefined}
    >
      {hasLabel ? (
        <span id={labelId} className={fieldStyles.label}>
          {label}
        </span>
      ) : null}
      {group}
      {hasDescription ? (
        <span id={descriptionId} className={fieldStyles.description} data-tone={tone}>
          {description}
        </span>
      ) : null}
    </div>
  );
}
