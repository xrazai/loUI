import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode, Ref, RefObject } from 'react';
import { Dialog, Heading, OverlayArrow, Popover } from 'react-aria-components';
import type { PopoverProps } from 'react-aria-components';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Button } from '../Button';
import { messages } from './Tour.messages';
import styles from './Tour.module.css';

export type TourPlacement = NonNullable<PopoverProps['placement']>;

export interface TourStep {
  /** Ref to the element the step points at. A step whose element is not mounted renders nothing. */
  target: RefObject<Element | null>;
  /** Short heading of the step and its accessible name. */
  title: ReactNode;
  /** One or two sentences that say what the element does and why it matters. */
  content: ReactNode;
  /** Side and alignment of this step. Overrides the `placement` of the tour. */
  placement?: TourPlacement;
}

export interface TourProps {
  /** The steps, in order. Each points at one element through `target`. */
  steps: readonly TourStep[];
  /** Zero-based index of the current step (controlled). Pair with `onStepChange`. */
  step?: number;
  /** Initial step when uncontrolled. Default `0`. */
  defaultStep?: number;
  /** Called when the user moves to another step. */
  onStepChange?: (step: number) => void;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with `false` when the tour is finished or skipped. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Called when the user presses Done on the last step. `onOpenChange(false)` follows. */
  onComplete?: () => void;
  /** Called when the user skips the tour, with `Skip tour` or `Escape`. `onOpenChange(false)` follows. */
  onSkip?: () => void;
  /** Side and alignment relative to the target. Default `bottom start`. Flips on collision. */
  placement?: TourPlacement;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  /** Class name for the step surface. */
  className?: string;
  /** Ref to the step surface. */
  ref?: Ref<HTMLElement>;
}

const noopSubscribe = () => () => undefined;

interface TourStepViewProps {
  step: TourStep;
  index: number;
  total: number;
  placement: TourPlacement;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  messages: Partial<typeof messages.en> | undefined;
  className: string | undefined;
  ref: Ref<HTMLElement> | undefined;
}

function TourStepView({
  step,
  index,
  total,
  placement,
  onBack,
  onNext,
  onSkip,
  messages: overrides,
  className,
  ref,
}: TourStepViewProps) {
  const t = useMessages('Tour', messages, overrides);
  // The element is read at render time through a snapshot, so a missing target renders nothing.
  const anchor = useSyncExternalStore(
    noopSubscribe,
    () => step.target.current,
    () => null,
  );
  useEffect(() => {
    anchor?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [anchor]);
  if (!anchor) return null;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  return (
    <Popover
      {...(ref ? { ref } : {})}
      triggerRef={step.target}
      isOpen
      isNonModal
      placement={step.placement ?? placement}
      offset={0}
      // Tabbing or pressing elsewhere must not end the tour; only Escape and the buttons do.
      shouldCloseOnInteractOutside={() => false}
      onOpenChange={(isOpen) => {
        if (!isOpen) onSkip();
      }}
      className={classNames(styles.root, className)}
      // RAC writes an inline z-index; the style prop is the only way to use the popover layer.
      style={{ zIndex: 'var(--ds-z-popover)' }}
    >
      <OverlayArrow className={classNames(styles.arrow)}>
        <svg viewBox="0 0 8 4" aria-hidden="true" focusable="false">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      <Dialog className={classNames(styles.dialog)}>
        <Heading slot="title" level={2} className={classNames(styles.title)}>
          {step.title}
        </Heading>
        <div className={classNames(styles.content)}>{step.content}</div>
        <div className={classNames(styles.footer)}>
          <span className={classNames(styles.progress)}>{t.progress(index + 1, total)}</span>
          <div className={classNames(styles.actions)}>
            {isLast ? null : (
              <Button size="sm" variant="ghost" onPress={onSkip}>
                {t.skip}
              </Button>
            )}
            {isFirst ? null : (
              <Button size="sm" onPress={onBack}>
                {t.back}
              </Button>
            )}
            <Button size="sm" variant="primary" onPress={onNext}>
              {isLast ? t.done : t.next}
            </Button>
          </div>
        </div>
      </Dialog>
    </Popover>
  );
}

/**
 * A step-by-step onboarding tour. Each step is a non-modal popover (React Aria `Popover` with
 * `isNonModal`) anchored to an element, with a title, a short text, a "Step 2 of 5" counter and
 * Skip, Back and Next or Done buttons. The page stays interactive; there is no scrim.
 *
 * Focus moves into each step as it appears (the step is a named dialog, so a screen reader
 * announces its title). `Escape` skips the tour. When the tour ends, focus returns to the element
 * that had it before the tour opened, normally the button that started it.
 *
 * Use a `Tooltip` for a hint on one control, and a `Popover` for interactive content. A tour is
 * for a few steps shown once; do not use it to hold documentation.
 */
export function Tour({
  steps,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  onComplete,
  onSkip,
  placement = 'bottom start',
  messages: overrides,
  className,
  ref,
}: TourProps) {
  const [isOpen, setOpen] = useControllableState({
    value: isOpenProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [current, setStep] = useControllableState({
    value: stepProp,
    defaultValue: defaultStep,
    onChange: onStepChange,
  });
  const [opener, setOpener] = useState<Element | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [restoreTo, setRestoreTo] = useState<HTMLElement | null>(null);
  // Focus goes back only after the step has unmounted: while the step still holds focus, moving it
  // is overridden by the step's own focus handling.
  useEffect(() => {
    if (!isOpen && restoreTo) {
      restoreTo.focus();
    }
  }, [isOpen, restoreTo]);
  // Remember what had focus when the tour opens. It must happen during render: the step's dialog
  // takes focus in its own mount effect, which runs before any effect of this component.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen && typeof document !== 'undefined') {
      setOpener(document.activeElement);
      setRestoreTo(null);
    }
  }

  const total = steps.length;
  const index = Math.min(Math.max(current, 0), total - 1);
  const active = steps[index];
  if (!isOpen || !active) return null;

  const finish = () => {
    const fallback = active.target.current;
    const destination =
      opener && opener !== document.body && opener.isConnected ? opener : fallback;
    if (destination instanceof HTMLElement) setRestoreTo(destination);
    setOpen(false);
    setStep(0);
  };

  return (
    <TourStepView
      // A new step is a new popover: it is positioned against its own target and takes focus.
      key={index}
      step={active}
      index={index}
      total={total}
      placement={placement}
      onBack={() => {
        setStep(index - 1);
      }}
      onNext={() => {
        if (index === total - 1) {
          finish();
          onComplete?.();
        } else {
          setStep(index + 1);
        }
      }}
      onSkip={() => {
        finish();
        onSkip?.();
      }}
      messages={overrides}
      className={className}
      ref={ref}
    />
  );
}
