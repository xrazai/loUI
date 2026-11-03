import type { CSSProperties, ReactNode, Ref } from 'react';
import { RadioButton, RadioField, RadioGroup as RACRadioGroup, Text } from 'react-aria-components';
import type { RadioGroupProps as RACRadioGroupProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './ChoiceTiles.module.css';

export type ChoiceTilesSize = 'md' | 'lg';

export interface ChoiceTilesOption {
  /** Value reported by `onChange` and matched by `value` / `defaultValue`. Unique in the group. */
  value: string;
  /** Main text of the tile: a short noun or phrase in sentence case. */
  label: string;
  /** Optional second line in mono (a code, a count, a price). Read as part of the option's name. Text or a short inline node. */
  meta?: ReactNode;
  /**
   * Optional second line under the meta line, in the body font: a short sentence that helps
   * decide ("Arrives in 2 to 3 days"). It is the option's accessible description, not part of
   * its name, so screen readers read the label first and the detail after it. Keep it to one or
   * two short lines.
   */
  detail?: ReactNode;
  /** Disables this tile. */
  isDisabled?: boolean;
}

interface ChoiceTilesBaseProps extends Omit<
  RACRadioGroupProps,
  'children' | 'className' | 'style' | 'orientation' | 'aria-label' | 'aria-labelledby'
> {
  /** The tiles, in display order. Two to eight fit well. */
  options: readonly ChoiceTilesOption[];
  /** Helper text under the label. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** Error text, shown while the group is invalid. */
  errorMessage?: FieldErrorMessage;
  /**
   * Maximum number of columns. Default `2`. The grid collapses to fewer columns on narrow
   * containers so a tile never gets narrower than `--ds-choice-tiles-min-width`.
   */
  columns?: number;
  /** Tile height: `md` 40px or `lg` 48px (default). */
  size?: ChoiceTilesSize;
  /** Class name for the group root. */
  className?: string | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the group root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type ChoiceTilesProps = ChoiceTilesBaseProps & FieldLabelingProps;

/**
 * Single-choice tiles: a `radiogroup` whose options are drawn as big buttons with a label and an
 * optional meta line. The group is one tab stop; arrow keys move focus and select, `Space`
 * selects (React Aria roving focus; arrows wrap at the ends like any radio group).
 * `value`, `defaultValue` and `onChange(value)` follow React Aria. A group needs a name: pass
 * `label`, `aria-label` or `aria-labelledby`.
 *
 * For a few short options drawn as one bar, use `SegmentedControl`; for a plain list of
 * options, use `RadioGroup`.
 */
export function ChoiceTiles({
  options,
  label,
  description,
  errorMessage,
  columns = 2,
  size = 'lg',
  className,
  messages: messageOverrides,
  ref,
  ...rest
}: ChoiceTilesProps) {
  warnMissingName('ChoiceTiles', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const style = { '--ds-choice-tiles-columns': Math.max(1, Math.floor(columns)) } as CSSProperties;
  return (
    <RACRadioGroup
      {...rest}
      ref={ref}
      orientation="horizontal"
      className={classNames(fieldStyles.root, className)}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <div className={styles.grid} style={style} data-size={size}>
        {options.map((option) => (
          <ChoiceTile key={option.value} option={option} />
        ))}
      </div>
      <FieldMessages description={description} errorMessage={errorMessage} />
    </RACRadioGroup>
  );
}

function ChoiceTile({ option }: { option: ChoiceTilesOption }) {
  const hasDetail = option.detail !== undefined && option.detail !== null && option.detail !== '';
  return (
    <RadioField
      value={option.value}
      isDisabled={option.isDisabled === true}
      className={classNames(styles.tile)}
    >
      <RadioButton className={classNames(styles.button)}>
        <span className={styles.label}>{option.label}</span>
        {option.meta ? <span className={styles.meta}>{option.meta}</span> : null}
        {hasDetail ? (
          // Hidden from the name (the tile is a <label>); the description slot links it with
          // aria-describedby, which still reads hidden text.
          <Text slot="description" className={styles.detail} aria-hidden="true">
            {option.detail}
          </Text>
        ) : null}
      </RadioButton>
    </RadioField>
  );
}
