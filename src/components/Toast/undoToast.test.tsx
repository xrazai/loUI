import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../../test/render';
import { createToastApi, createToastQueue, toast } from './queue';
import { ToastRegion } from './Toast';
import { toastWithUndo } from './undoToast';

function setup() {
  const queue = createToastQueue();
  return { queue, api: createToastApi(queue) };
}

const firstToast = (queue: ReturnType<typeof createToastQueue>) => queue.visibleToasts[0];

describe('toastWithUndo', () => {
  it('uses the English "Undo" label by default, with a success tone', () => {
    const { queue, api } = setup();
    const key = toastWithUndo('3 items archived', { toast: api, onUndo: () => undefined });
    expect(firstToast(queue)?.key).toBe(key);
    expect(firstToast(queue)?.content.action?.label).toBe('Undo');
    expect(firstToast(queue)?.content.tone).toBe('success');
    expect(firstToast(queue)?.content.message).toBe('3 items archived');
  });

  it('calls onUndo when the action is pressed', () => {
    const { queue, api } = setup();
    const onUndo = vi.fn();
    toastWithUndo('Order #1051 archived', { toast: api, onUndo });
    firstToast(queue)?.content.action?.onPress();
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('takes the label from an explicit locale', () => {
    const { queue, api } = setup();
    toastWithUndo('Pedido arquivado', { toast: api, onUndo: () => undefined, locale: 'pt-BR' });
    expect(firstToast(queue)?.content.action?.label).toBe('Desfazer');
  });

  it('falls back to English for a locale without a catalogue', () => {
    const { queue, api } = setup();
    toastWithUndo('Archived', { toast: api, onUndo: () => undefined, locale: 'fr-FR' });
    expect(firstToast(queue)?.content.action?.label).toBe('Undo');
  });

  it('lets a per-call message override win over the locale', () => {
    const { queue, api } = setup();
    toastWithUndo('Archived', {
      toast: api,
      onUndo: () => undefined,
      locale: 'pt-BR',
      messages: { undo: 'Revert' },
    });
    expect(firstToast(queue)?.content.action?.label).toBe('Revert');
  });

  it('follows the locale of the mounted ToastRegion (DSProvider) without any option', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />, { locale: 'pt-BR' });
    act(() => {
      toastWithUndo('Pedido arquivado', { toast: api, onUndo: () => undefined, timeout: null });
    });
    expect(queue.visibleToasts.at(-1)?.content.action?.label).toBe('Desfazer');
  });

  it('follows a provider message override of the Toast catalogue', async () => {
    const { queue, api } = setup();
    await renderWithProvider(<ToastRegion queue={queue} />, {
      messages: { Toast: { undo: 'Take back' } },
    });
    act(() => {
      toastWithUndo('Archived', { toast: api, onUndo: () => undefined, timeout: null });
    });
    expect(queue.visibleToasts.at(-1)?.content.action?.label).toBe('Take back');
  });

  it('goes back to English once the region unmounts', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(<ToastRegion queue={queue} />, { locale: 'pt-BR' });
    await screen.unmount();
    toastWithUndo('Archived', { toast: api, onUndo: () => undefined, timeout: null });
    expect(firstToast(queue)?.content.action?.label).toBe('Undo');
  });

  it('passes tone and the other toast options through', () => {
    const { queue, api } = setup();
    const onClose = vi.fn();
    const key = toastWithUndo('Heads up', {
      toast: api,
      onUndo: () => undefined,
      tone: 'warning',
      timeout: 1234,
      onClose,
    });
    expect(firstToast(queue)?.content.tone).toBe('warning');
    expect(firstToast(queue)?.timeout).toBe(1234);
    api.close(key);
    expect(onClose).toHaveBeenCalled();
  });

  it('writes to the shared toast by default', () => {
    toast.clear();
    const key = toastWithUndo('Saved', { onUndo: () => undefined });
    expect(typeof key).toBe('string');
    toast.clear();
  });
});

describe('toastWithUndo groupKey (GAP-053)', () => {
  it('replaces the previous toast of the same group and keeps others', () => {
    const { queue, api } = setup();
    const onClose = vi.fn();
    toastWithUndo('Toggled 1', { toast: api, onUndo: () => undefined, groupKey: 'g', onClose });
    toastWithUndo('Other', { toast: api, onUndo: () => undefined, groupKey: 'h' });
    toastWithUndo('Toggled 2', { toast: api, onUndo: () => undefined, groupKey: 'g' });
    toastWithUndo('Toggled 3', { toast: api, onUndo: () => undefined, groupKey: 'g' });
    expect(queue.visibleToasts.map((t) => t.content.message)).toEqual(['Toggled 3', 'Other']);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stacks toasts without a groupKey', () => {
    const { queue, api } = setup();
    toastWithUndo('A', { toast: api, onUndo: () => undefined });
    toastWithUndo('B', { toast: api, onUndo: () => undefined });
    expect(queue.visibleToasts).toHaveLength(2);
  });
});
