import { createContext } from 'react';

/** Defaults a `ToggleGroup` hands down to its `Toggle` children. Internal. */
export interface ToggleGroupDefaults {
  variant?: 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ToggleGroupDefaultsContext = createContext<ToggleGroupDefaults>({});
