/** The key event React Aria hands to `onKeyDown`: a React event plus `continuePropagation()`. */
interface PropagatingKeyEvent {
  isDefaultPrevented: () => boolean;
  continuePropagation: () => void;
}

/**
 * React Aria stops propagation of every key event that reaches a consumer `onKeyDown`, which
 * hides the key from page-level shortcuts (`useHotkeys` with `allowInEditable`). This wraps the
 * consumer handler so the key keeps bubbling unless the handler claimed it with
 * `event.preventDefault()`.
 *
 * @internal
 */
export function continueUnhandledKeys<E extends PropagatingKeyEvent>(
  handler: (event: E) => void,
): (event: E) => void {
  return (event) => {
    handler(event);
    if (!event.isDefaultPrevented()) event.continuePropagation();
  };
}
