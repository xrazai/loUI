import type { ReactNode, Ref } from 'react';
import { ToggleButtonGroup } from 'react-aria-components';
import type { ToggleButtonGroupProps } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { classNames } from '../../utils/classNames';
import { ToggleGroupDefaultsContext } from '../Toggle/ToggleContext';
import type { ToggleSize, ToggleVariant } from '../Toggle';
import styles from './ToggleGroup.module.css';

export type ToggleGroupSelectionMode = 'single' | 'multiple';
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

interface ToggleGroupBaseProps extends Omit<
  ToggleButtonGroupProps,
  | 'className'
  | 'style'
  | 'children'
  | 'render'
  | 'slot'
  | 'selectionMode'
  | 'selectedKeys'
  | 'defaultSelectedKeys'
  | 'onSelectionChange'
  | 'orientation'
  | 'aria-label'
  | 'aria-labelledby'
> {
  /** The `Toggle` children. Each needs an `id` that is unique in the group. */
  children: ReactNode;
  /**
   * `multiple` (default): any number of toggles can be pressed, independently (text formatting,
   * filters); the group is a toolbar. `single`: at most one is pressed; the group is a radio
   * group. To pick exactly one value of a setting prefer `SegmentedControl`.
   */
  selectionMode?: ToggleGroupSelectionMode;
  /** The `id`s of the pressed toggles (controlled). Pair with `onChange`. */
  value?: readonly string[];
  /** The `id`s of the toggles that start pressed (uncontrolled). */
  defaultValue?: readonly string[];
  /** Called with the `id`s of all pressed toggles after the user presses or releases one. */
  onChange?: (value: string[]) => void;
  /** Keeps at least one toggle pressed. Pointless in `multiple` mode unless you want that rule. */
  disallowEmptySelection?: boolean;
  /** Layout and arrow keys: `horizontal` (default, `←` `→`) or `vertical` (`↑` `↓`). */
  orientation?: ToggleGroupOrientation;
  /** Visual style handed down to every `Toggle` that does not set its own. */
  variant?: ToggleVariant;
  /** Size handed down to every `Toggle` that does not set its own. */
  size?: ToggleSize;
  className?: string;
  /** Ref to the group element. */
  ref?: Ref<HTMLDivElement>;
}

interface LabelledByText extends ToggleGroupBaseProps {
  /** Accessible name of the group ("Text formatting"). Required: name this or use `aria-labelledby`. */
  'aria-label': string;
  'aria-labelledby'?: string;
}

interface LabelledByElement extends ToggleGroupBaseProps {
  'aria-label'?: string;
  /** Id of the element that names the group. */
  'aria-labelledby': string;
}

export type ToggleGroupProps = LabelledByText | LabelledByElement;

/**
 * A row (or column) of related `Toggle`s that share one value: the list of pressed `id`s.
 *
 * With the default `multiple` selection the toggles are independent (bold, italic, underline;
 * or a set of filters) and the group is a `toolbar`. With `single` selection it behaves like
 * a radio group that can also be empty.
 *
 * `ToggleGroup` vs `SegmentedControl`: a `SegmentedControl` is one value of one setting (View:
 * List, Board), exactly one option is always selected. A `ToggleGroup` is a set of on/off
 * choices where none, one or several are on.
 *
 * Built on React Aria `ToggleButtonGroup`: one tab stop, arrow keys move between toggles (they
 * stop at the ends), `Space` and `Enter` toggle the focused one.
 */
export function ToggleGroup({
  children,
  selectionMode = 'multiple',
  value,
  defaultValue,
  onChange,
  orientation = 'horizontal',
  variant,
  size,
  className,
  ...rest
}: ToggleGroupProps) {
  const [current, setCurrent] = useControllableState<readonly string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onChange
      ? (next) => {
          onChange([...next]);
        }
      : undefined,
  });
  return (
    <ToggleGroupDefaultsContext
      value={{ ...(variant ? { variant } : {}), ...(size ? { size } : {}) }}
    >
      <ToggleButtonGroup
        {...rest}
        selectionMode={selectionMode}
        orientation={orientation}
        selectedKeys={current}
        onSelectionChange={(keys) => {
          const next = [...keys].map(String);
          // React Aria reports the unchanged selection when an empty one is not allowed.
          if (next.length === current.length && next.every((id) => current.includes(id))) return;
          setCurrent(next);
        }}
        className={classNames(styles.root, className)}
      >
        {children}
      </ToggleButtonGroup>
    </ToggleGroupDefaultsContext>
  );
}
