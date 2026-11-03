import { useContext, useState } from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

/**
 * Keeps the last value rendered while the overlay was open, for as long as the overlay plays its
 * exit animation (GAP-036).
 *
 * `Dialog` and `Sheet` stay mounted while they slide or fade out, but they render whatever their
 * props are at that moment. Consumers usually clear the state that feeds the content in the same
 * update that closes the overlay, so without this the panel would animate out empty (blank
 * fields, a title that disappears). Call it from a component rendered inside `ModalOverlay`; it
 * reads the open state from React Aria's overlay context.
 *
 * `value` must be referentially stable between renders that do not come from a new parent
 * render (a component's own `props` object is). While the overlay is open the hook returns
 * `value` unchanged; once it closes it returns the value of the last open render. It touches no
 * browser API, so it is SSR-safe, and it is a no-op outside an overlay.
 */
export function useRetainedWhileClosing<T>(value: T): T {
  const state = useContext(OverlayTriggerStateContext);
  const isOpen = state ? state.isOpen : true;
  const [retained, setRetained] = useState(value);
  // Derived state, set during render (React's "storing information from previous renders").
  if (isOpen && retained !== value) setRetained(value);
  return isOpen ? value : retained;
}
