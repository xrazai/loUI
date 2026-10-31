import { useId } from 'react';
import type { ReactNode, Ref } from 'react';
import {
  Slider as RACSlider,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import type { SliderProps as RACSliderProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { Label } from '../Field';
import type { FieldLabelingProps } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './Slider.module.css';

interface SliderBaseProps extends Omit<
  RACSliderProps<number>,
  | 'children'
  | 'className'
  | 'style'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onChangeEnd'
  | 'orientation'
  | 'formatOptions'
> {
  /** The value when controlled. Pair with `onChange`. */
  value?: number | undefined;
  /** The initial value when uncontrolled. Defaults to `minValue`. */
  defaultValue?: number | undefined;
  /** Called while the value changes (each key press, each pointer move). */
  onChange?: ((value: number) => void) | undefined;
  /** Called once when a drag ends or a key press is committed. Use it to save. */
  onChangeEnd?: ((value: number) => void) | undefined;
  /**
   * Formats the value shown next to the label and spoken to screen readers
   * (`aria-valuetext`): `{ style: 'percent' }`, `{ style: 'unit', unit: 'kilometer' }`, ...
   * Uses the locale of `DSProvider`.
   */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** Name for form submission; the form receives the number. */
  name?: string | undefined;
  /** Shows the formatted value (mono) on the right of the label. Default `true`. */
  showValue?: boolean | undefined;
  /** Helper text under the track, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type SliderProps = SliderBaseProps & FieldLabelingProps;

/**
 * A single-value slider built on React Aria `Slider`: a labelled track with one thumb that is a
 * real `<input type="range">`, so keyboard, pointer, touch and form submission (`name`) work
 * natively. Keys: arrows step by `step`, `PageUp`/`PageDown` move by a larger step (10% of the
 * range, at least `step`), `Home`/`End` jump to the limits.
 *
 * Range selection with two thumbs is not part of this component yet.
 */
export function Slider({
  label,
  description,
  showValue = true,
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  className,
  ref,
  ...rest
}: SliderProps) {
  warnMissingName('Slider', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const { name, formatOptions, ...rootProps } = rest;
  const descriptionId = useId();
  return (
    <RACSlider
      {...rootProps}
      ref={ref}
      className={classNames(fieldStyles.root, styles.root, className)}
      {...(formatOptions ? { formatOptions } : {})}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange ? { onChange } : {})}
      {...(onChangeEnd ? { onChangeEnd } : {})}
    >
      {label || showValue ? (
        <div className={styles.header}>
          {label ? <Label className={styles.label}>{label}</Label> : <span />}
          {showValue ? <SliderOutput className={classNames(styles.output)} /> : null}
        </div>
      ) : null}
      <SliderTrack className={classNames(styles.track)}>
        <div className={styles.rail} />
        <SliderFill className={classNames(styles.fill)} />
        <SliderThumb
          className={classNames(styles.thumb)}
          {...(name === undefined ? {} : { name })}
          {...(description ? { 'aria-describedby': descriptionId } : {})}
        >
          <span className={styles.dot} />
        </SliderThumb>
      </SliderTrack>
      {description ? (
        <span id={descriptionId} className={fieldStyles.description}>
          {description}
        </span>
      ) : null}
    </RACSlider>
  );
}
