import type { CSSProperties, ReactNode } from 'react';

type Size = number | string;

export interface StoryFrameProps {
  /** Maximum inline size of the frame (a number is CSS px). */
  maxWidth?: Size;
  /** Fixed inline size of the frame. */
  width?: Size;
  /** Minimum block size, to leave room for a popover that opens below its trigger. */
  minHeight?: Size;
  /** Fixed block size of the frame. */
  height?: Size;
  /** Draws a bordered, rounded flex column box, to show a component filling a bounded container. */
  box?: boolean;
  /** Inset in space-scale steps (`12` = `--ds-space-12`), to leave room around an overlay trigger. */
  padding?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  /** Lays children out in a row (`display: flex`), so a child can fill the frame height. */
  flex?: boolean;
  /** Clips content that overflows the frame. */
  clip?: boolean;
  /** Text direction, for right-to-left stories. */
  dir?: 'ltr' | 'rtl';
  children?: ReactNode;
}

/**
 * Sizes the canvas of a story: the width a component is shown at, or the room it needs for an
 * overlay. Stories use it instead of `style` so story wrappers stay free of raw spacing
 * (`loui/no-raw-spacing`, AI-015). Not part of the public API.
 */
export function StoryFrame({
  maxWidth,
  width,
  minHeight,
  height,
  padding,
  flex,
  box,
  clip,
  dir,
  children,
}: StoryFrameProps) {
  const style: CSSProperties = {
    ...(maxWidth === undefined ? {} : { maxInlineSize: maxWidth }),
    ...(width === undefined ? {} : { inlineSize: width }),
    ...(minHeight === undefined ? {} : { minBlockSize: minHeight }),
    ...(height === undefined ? {} : { blockSize: height }),
    ...(padding === undefined ? {} : { padding: `var(--ds-space-${padding})` }),
    ...(flex ? { display: 'flex' } : {}),
    ...(box
      ? {
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--ds-line)',
          borderRadius: 'var(--ds-radius-lg)',
        }
      : {}),
    ...(clip ? { overflow: 'hidden' } : {}),
  };
  return (
    <div dir={dir} style={style}>
      {children}
    </div>
  );
}
