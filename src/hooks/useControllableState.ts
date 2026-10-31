import { useControlledState } from 'react-stately/useControlledState';

export interface UseControllableStateOptions<T> {
  /** Controlled value. Pass `undefined` to leave the component uncontrolled. */
  value?: T | undefined;
  /** Initial value when uncontrolled. */
  defaultValue: T;
  /** Called with the new value whenever the user changes it (controlled or not). */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * Controlled/uncontrolled state for the `value` / `defaultValue` / `onValueChange`
 * convention (AGENTS.md section 9). Thin wrapper over react-stately's `useControlledState`,
 * which also warns in development when a component switches between modes.
 *
 * ```tsx
 * const [value, setValue] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '', onChange: props.onValueChange });
 * ```
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (value: T) => void] {
  const [current, setCurrent] = useControlledState<T>(
    value as Exclude<T, undefined> | undefined,
    defaultValue as Exclude<T, undefined>,
    onChange,
  );
  return [current, setCurrent];
}
