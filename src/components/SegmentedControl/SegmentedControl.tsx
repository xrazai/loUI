import type { Ref } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import type { ToggleButtonGroupProps } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { useDSLocale } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
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
  /** Height of the segments: `sm` 24px, `md` 32px (default). */
  size?: SegmentedControlSize;
  /** Stretch to the container; the segments share the width equally. */
  fullWidth?: boolean;
  className?: string;
  /** Ref to the group element. */
  ref?: Ref<HTMLDivElement>;
}

interface LabelledByText extends SegmentedControlBaseProps {
  /** Accessible name of the group ("View"). Required: name this or use `aria-labelledby`. */
  'aria-label': string;
  'aria-labelledby'?: string;
}

interface LabelledByElement extends SegmentedControlBaseProps {
  'aria-label'?: string;
  /** Id of the element that names the group. */
  'aria-labelledby': string;
}

export type SegmentedControlProps = LabelledByText | LabelledByElement;

/**
 * A segmented control picks one value from a few options, like a radio group drawn as a
 * bar. It is a value control: it does not own panels (use `Tabs` for that). Exactly one
 * option is always selected.
 *
 * Built on React Aria `ToggleButtonGroup` with single selection and no empty selection:
 * it is exposed as a radio group, with one tab stop and arrow-key navigation.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps) {
  const locale = useDSLocale();
  const firstEnabled = options.find((option) => option.isDisabled !== true)?.value;
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? firstEnabled ?? '',
    onChange,
  });
  return (
    <ToggleButtonGroup
      {...rest}
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
            <span className={styles.label}>{option.label}</span>
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
}
