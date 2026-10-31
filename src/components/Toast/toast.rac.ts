/**
 * The only file in the library that imports React Aria's `UNSTABLE_Toast*` exports (ADR-0001).
 * When React Aria renames or stabilizes them, this file is the single change. Everything else
 * imports the stable names below.
 */
export {
  UNSTABLE_Toast as RacToast,
  UNSTABLE_ToastContent as RacToastContent,
  UNSTABLE_ToastQueue as RacToastQueue,
  UNSTABLE_ToastRegion as RacToastRegion,
} from 'react-aria-components';
export type { QueuedToast, ToastOptions as RacToastOptions } from 'react-aria-components';
