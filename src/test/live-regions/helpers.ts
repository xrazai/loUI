/**
 * Helpers for the live-region suites (TEST-018).
 *
 * Real NVDA / VoiceOver runs are not possible in CI, so these tests check what a screen reader
 * is *given*:
 *
 * - `recordAnnouncements` watches the DOM with a `MutationObserver` and reports every time the
 *   text of a live region (`role="status" | "alert" | "log"` or `aria-live` not `off`) changes.
 *   A browser only hands a live region to assistive technology when its content mutates, and the
 *   mutations of one React commit arrive in one batch, so one record is one potential
 *   announcement. Regions that resolve to `aria-live="off"` (the ChatPanel log) are never
 *   recorded: that is exactly the point of the log.
 * - `axNodes` reads Chromium's accessibility tree through the Chrome DevTools Protocol, the
 *   same data Chromium sends to platform accessibility APIs (UIA, NSAccessibility). It exposes
 *   role, accessible name and the `live`, `atomic`, `busy` and `focusable` properties.
 *
 * Vitest browser mode runs the tests inside an iframe, so the tree is requested for that frame.
 */
import { cdp } from 'vitest/browser';

const LIVE_SELECTOR = '[aria-live],[role="status"],[role="alert"],[role="log"]';

type Politeness = 'polite' | 'assertive';

export interface Announcement {
  /** `change` when text inside an existing live region mutated, `insert` when the region itself was added. */
  kind: 'change' | 'insert';
  politeness: Politeness;
  role: string | null;
  /** Text content of the region (it is atomic in every component under test). */
  text: string;
}

function politenessOf(region: Element): Politeness | null {
  const explicit = region.getAttribute('aria-live');
  if (explicit === 'polite' || explicit === 'assertive') return explicit;
  if (explicit === 'off') return null;
  switch (region.getAttribute('role')) {
    case 'alert':
      return 'assertive';
    case 'status':
    case 'log':
      return 'polite';
    default:
      return null;
  }
}

function hiddenFromAT(el: Element): boolean {
  return el.closest('[aria-hidden="true"],[hidden],[inert]') !== null;
}

function elementOf(node: Node): Element | null {
  return node instanceof Element ? node : node.parentElement;
}

/**
 * Starts recording live-region announcements under `document.body`. Call it **before** rendering
 * so that the first render is part of the record. `stop()` disconnects the observer and
 * returns everything recorded.
 */
export function recordAnnouncements() {
  const records: Announcement[] = [];

  const push = (region: Element, kind: Announcement['kind']) => {
    const politeness = politenessOf(region);
    if (!politeness || hiddenFromAT(region)) return;
    const text = region.textContent.trim();
    if (text === '') return;
    records.push({ kind, politeness, role: region.getAttribute('role'), text });
  };

  const observer = new MutationObserver((mutations) => {
    const changed = new Set<Element>();
    const inserted = new Set<Element>();
    for (const mutation of mutations) {
      for (const added of Array.from(mutation.addedNodes)) {
        if (!(added instanceof Element)) continue;
        if (added.matches(LIVE_SELECTOR)) inserted.add(added);
        for (const inner of Array.from(added.querySelectorAll(LIVE_SELECTOR))) inserted.add(inner);
      }
      const region = elementOf(mutation.target)?.closest(LIVE_SELECTOR);
      if (region) changed.add(region);
    }
    for (const region of inserted) push(region, 'insert');
    for (const region of changed) {
      if (!inserted.has(region) && region.isConnected) push(region, 'change');
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  return {
    records,
    /** Texts only, in order. */
    texts: () => records.map((r) => r.text),
    stop() {
      observer.disconnect();
      return records;
    },
  };
}

export interface AxNode {
  role: string;
  name: string;
  /** `live`, `atomic`, `busy`, `focusable`, `focused`, … as Chromium reports them. */
  properties: Record<string, unknown>;
}

interface RawAxNode {
  ignored?: boolean;
  role?: { value?: string };
  name?: { value?: string };
  properties?: { name: string; value: { value: unknown } }[];
}

/** The frame that runs the test: the only child of the Vitest runner page. */
async function testFrameId(): Promise<string | undefined> {
  const session = cdp();
  await session.send('Page.enable');
  const { frameTree } = (await session.send('Page.getFrameTree')) as {
    frameTree: { frame: { id: string }; childFrames?: { frame: { id: string } }[] };
  };
  return frameTree.childFrames?.[0]?.frame.id ?? frameTree.frame.id;
}

/** Non-ignored nodes of Chromium's accessibility tree for the test frame. */
export async function axNodes(): Promise<AxNode[]> {
  const session = cdp();
  await session.send('Accessibility.enable');
  const frameId = await testFrameId();
  const { nodes } = (await session.send('Accessibility.getFullAXTree', {
    ...(frameId ? { frameId } : {}),
  })) as { nodes: RawAxNode[] };
  return nodes
    .filter((n) => !n.ignored)
    .map((n) => ({
      role: n.role?.value ?? '',
      name: n.name?.value ?? '',
      properties: Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value])),
    }));
}

/** First node with the role (and, when given, the exact accessible name). */
export async function axFind(role: string, name?: string): Promise<AxNode | undefined> {
  return (await axNodes()).find((n) => n.role === role && (name === undefined || n.name === name));
}
