import { useCallback, useId, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { ToggleButtonGroup } from 'react-aria-components';
import type { ToggleButtonGroupProps } from 'react-aria-components';
import { ErrorText, Label } from '../../components/Field';
import type { FieldErrorMessage, FieldLabelingProps } from '../../components/Field';
import fieldStyles from '../../components/Field/Field.module.css';
import { warnMissingName } from '../../components/Field/labeling';
import { useControllableState } from '../../hooks';
import { classNames } from '../../utils/classNames';
import styles from './ColorOptionGroup.module.css';

export type ColorOptionGroupSelectionMode = 'single' | 'multiple';

interface ColorOptionGroupBaseProps extends Omit<
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
  | 'disabledKeys'
  | 'orientation'
  | 'disallowEmptySelection'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
> {
  /** The `ColorOption` children. Each needs an `id` that is unique in the group (its value). */
  children: ReactNode;
  /**
   * `multiple` (default): any number of colors can be chosen (the group is a `toolbar` of toggle
   * buttons). `single`: at most one color (a `radiogroup`).
   */
  selectionMode?: ColorOptionGroupSelectionMode;
  /** The `id`s of the chosen options (controlled). Pair with `onChange`. */
  value?: readonly string[];
  /** The `id`s of the options chosen at the start (uncontrolled). */
  defaultValue?: readonly string[];
  /** Called with the `id`s of all chosen options after the user chooses or clears one. */
  onChange?: (value: string[]) => void;
  /** Helper text under the options. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** Error text, shown while `isInvalid` is set. Linked with `aria-describedby`. */
  errorMessage?: FieldErrorMessage;
  /** Marks the group invalid: danger border on the unselected options and the error text. */
  isInvalid?: boolean;
  /**
   * Maximum number of columns. Default `2`. The grid collapses to fewer columns on narrow
   * containers so an option never gets narrower than `--ds-color-option-group-min-width`.
   */
  columns?: number;
  /** Class name for the group root. */
  className?: string | undefined;
  /** Ref to the element that holds the options. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type ColorOptionGroupProps = ColorOptionGroupBaseProps & FieldLabelingProps;

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}

/**
 * A named group of `ColorOption`s that shares one value: the list of chosen option `id`s. It
 * adds the group name (`label`, `aria-label` or `aria-labelledby`), helper text, an error linked
 * with `aria-describedby`, per-option `isDisabled` (set it on the `ColorOption`) and one tab
 * stop with arrow keys between options (they stop at the ends, like `ToggleGroup`). `Space` and
 * `Enter` choose the focused option.
 *
 * List the options alphabetically by label (AGENTS.md 5b); the group keeps the order you give.
 * Built on React Aria `ToggleButtonGroup`.
 */
export function ColorOptionGroup({
  children,
  label,
  description,
  errorMessage,
  isInvalid = false,
  selectionMode = 'multiple',
  value,
  defaultValue,
  onChange,
  columns = 2,
  className,
  ref,
  ...rest
}: ColorOptionGroupProps) {
  warnMissingName('ColorOptionGroup', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const groupRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  // React Aria does not forward `aria-invalid` to the group. It is allowed on a radiogroup
  // (`single`) but not on the toolbar used in `multiple` mode.
  const markInvalid = isInvalid && selectionMode === 'single';
  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    if (markInvalid) node.setAttribute('aria-invalid', 'true');
    else node.removeAttribute('aria-invalid');
  }, [markInvalid]);
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [current, setCurrent] = useControllableState<readonly string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onChange
      ? (next) => {
          onChange([...next]);
        }
      : undefined,
  });
  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors: [], validationDetails: {} as ValidityState })
      : errorMessage;
  const showDescription = hasContent(description);
  const showError = isInvalid && hasContent(resolvedError);
  const describedBy =
    [showDescription ? descriptionId : undefined, showError ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  const labelledBy =
    [label ? labelId : undefined, rest['aria-labelledby']].filter(Boolean).join(' ') || undefined;
  const style = {
    '--ds-color-option-group-columns': Math.max(1, Math.floor(columns)),
  } as CSSProperties;
  return (
    <div
      className={classNames(fieldStyles.root, className)}
      data-disabled={rest.isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <Label id={labelId} elementType="span">
          {label}
        </Label>
      ) : null}
      <ToggleButtonGroup
        {...rest}
        ref={setRefs}
        {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        selectionMode={selectionMode}
        orientation="horizontal"
        selectedKeys={current}
        onSelectionChange={(keys) => {
          const next = [...keys].map(String);
          // React Aria reports the unchanged selection when nothing changed.
          if (next.length === current.length && next.every((id) => current.includes(id))) return;
          setCurrent(next);
        }}
        className={classNames(styles.grid)}
        style={style}
        data-invalid={isInvalid || undefined}
      >
        {children}
      </ToggleButtonGroup>
      {showDescription ? (
        <p id={descriptionId} className={fieldStyles.description}>
          {description}
        </p>
      ) : null}
      {showError ? <ErrorText id={errorId}>{resolvedError}</ErrorText> : null}
    </div>
  );
}
