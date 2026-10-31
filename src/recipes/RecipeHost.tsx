import type { ReactNode } from 'react';
import { ToastRegion } from '../index';

/**
 * Mounts what an app mounts once near its root and recipes rely on: the toast region. Used by
 * the recipe stories and tests; a real app already has it. Not part of the recipes' copyable code.
 */
export function RecipeHost({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastRegion />
    </>
  );
}
