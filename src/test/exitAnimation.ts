/**
 * Helpers for the overlay exit-animation suites (GAP-036).
 *
 * `watchExit` records, on every DOM mutation, whether a dialog that is playing its exit animation
 * (an ancestor has `data-exiting`) still shows the expected text and field values. A mutation
 * observer reports in a microtask after each commit, so a frame that would show a blank panel
 * cannot slip between two polls.
 */
export interface ExitWatch {
  /** Stops watching and reports what was seen. */
  stop: () => { sawExiting: boolean; blank: string[] };
}

export function watchExit(expected: { text: string[]; values?: string[] }): ExitWatch {
  let sawExiting = false;
  const blank: string[] = [];
  const check = () => {
    for (const dialog of document.querySelectorAll('[role="dialog"], [role="alertdialog"]')) {
      if (!dialog.closest('[data-exiting]')) continue;
      sawExiting = true;
      const content = dialog.textContent;
      for (const text of expected.text) {
        if (!content.includes(text)) blank.push(`missing text "${text}"`);
      }
      const values = Array.from(dialog.querySelectorAll('input, textarea')).map(
        (field) => (field as HTMLInputElement).value,
      );
      for (const value of expected.values ?? []) {
        if (!values.includes(value)) blank.push(`missing value "${value}"`);
      }
    }
  };
  const observer = new MutationObserver(check);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  return {
    stop: () => {
      check();
      observer.disconnect();
      return { sawExiting, blank };
    },
  };
}
