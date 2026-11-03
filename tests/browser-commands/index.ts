/**
 * Custom Vitest browser commands (TEST-017). They run in Node and drive the real browser through
 * Playwright, for gestures a page script cannot fake:
 *
 * - `grantClipboard` lets the page write to the system clipboard, so `Ctrl+V` pastes a real file.
 * - `dropFiles` performs a native file drop through the Chrome DevTools Protocol. React Aria
 *   rejects synthetic `DragEvent`s (it needs `webkitGetAsEntry()`), a CDP drag has real files.
 *
 * Registered under `browser.commands` of the `browser` project in `vitest.config.ts`.
 */
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { BrowserCommand } from 'vitest/node';

export interface DropFileSpec {
  name: string;
  /** UTF-8 text content of the temporary file. */
  content: string;
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    grantClipboard: () => Promise<void>;
    /** Drops the files onto the first element matching `selector`, as a native drag from the desktop. */
    dropFiles: (selector: string, files: DropFileSpec[]) => Promise<void>;
  }
}

export const grantClipboard: BrowserCommand = async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: new URL(page.url()).origin,
  });
};

export const dropFiles: BrowserCommand<[string, DropFileSpec[]]> = async (
  { context, page, iframe },
  selector,
  files,
) => {
  const directory = await mkdtemp(join(tmpdir(), 'loui-drop-'));
  const paths: string[] = [];
  for (const file of files) {
    const path = join(directory, file.name);
    await writeFile(path, file.content);
    paths.push(path);
  }
  const box = await iframe.locator(selector).first().boundingBox();
  if (!box) throw new Error(`dropFiles: no visible element matches "${selector}".`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const session = await context.newCDPSession(page);
  try {
    // dragOperationsMask 1 = copy.
    const data = { items: [], files: paths, dragOperationsMask: 1 };
    for (const type of ['dragEnter', 'dragOver', 'drop'] as const) {
      await session.send('Input.dispatchDragEvent', { type, x, y, data });
    }
  } finally {
    await session.detach();
  }
};
