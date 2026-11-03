/**
 * Shared helpers for the keyboard-contract suites (TEST-004, AGENTS.md section 8).
 *
 * Each suite reads like one row of the contract table: render the pattern between two plain
 * buttons ("Before" / "After") so Tab order is observable, drive it with real key presses and
 * assert where focus is. Nothing here sleeps; every assertion polls.
 */
import { userEvent } from 'vitest/browser';
import { expect } from 'vitest';

/** Human label of an element, as a user (or screen reader) would hear it. */
export function labelOf(element: Element | null): string {
  if (!element) return '(none)';
  const aria = element.getAttribute('aria-label');
  if (aria) return aria;
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent.trim() ?? '')
      .join(' ')
      .trim();
    if (text) return text;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const labelText = [...(element.labels ?? [])]
      .map((label) => label.textContent.trim())
      .join(' ')
      .trim();
    if (labelText) return labelText;
  }
  const text = element.textContent.trim();
  if (text) return text;
  if (element instanceof HTMLInputElement && element.value) return element.value;
  return element.getAttribute('placeholder') ?? element.tagName.toLowerCase();
}

/** Label of the element that has focus right now. */
export function activeLabel(): string {
  return labelOf(document.activeElement);
}

/** Waits until focus is on an element with exactly this label. */
export async function expectFocus(label: string): Promise<void> {
  await expect.poll(activeLabel).toBe(label);
}

/** Waits until focus is on this element. */
export async function expectFocusOn(element: Element): Promise<void> {
  await expect.poll(() => document.activeElement === element).toBe(true);
}

/** Presses a key sequence (user-event syntax: `{ArrowDown}`, `{Shift>}{Tab}{/Shift}`, `a`). */
export async function press(keys: string, times = 1): Promise<void> {
  for (let i = 0; i < times; i += 1) await userEvent.keyboard(keys);
}

/** Moves focus programmatically to an element (the "arrive from outside" step of most rows). */
export function focus(element: HTMLElement): void {
  element.focus();
  expect(document.activeElement).toBe(element);
}

/**
 * Presses Tab `count` times and returns the label of the focused element after each press.
 * Use it to assert the Tab order, e.g. a roving group is exactly one stop.
 */
export async function tabOrder(count: number, reverse = false): Promise<string[]> {
  const stops: string[] = [];
  for (let i = 0; i < count; i += 1) {
    await (reverse ? userEvent.keyboard('{Shift>}{Tab}{/Shift}') : userEvent.tab());
    stops.push(activeLabel());
  }
  return stops;
}

/** True when the active element is inside `container`. */
export function focusIsWithin(container: Element | null): boolean {
  return !!container && container.contains(document.activeElement);
}

/** The element with `role` inside the document, throwing when absent (for non-locator queries). */
export function byRole(role: string, name?: string): HTMLElement {
  const candidates = [...document.querySelectorAll<HTMLElement>(`[role="${role}"]`)];
  const match = name ? candidates.find((el) => labelOf(el) === name) : candidates[0];
  if (!match) throw new Error(`No element with role "${role}"${name ? ` named "${name}"` : ''}`);
  return match;
}

/** Presses Tab until the focused element has `label` (at most `max` presses), returning the labels visited. */
export async function tabTo(label: string, max = 10): Promise<string[]> {
  const visited: string[] = [];
  for (let i = 0; i < max; i += 1) {
    await userEvent.tab();
    visited.push(activeLabel());
    if (activeLabel() === label) break;
  }
  await expectFocus(label);
  return visited;
}
