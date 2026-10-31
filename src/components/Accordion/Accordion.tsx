import type { ReactNode, Ref } from 'react';
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
} from 'react-aria-components';
import type { DisclosureGroupProps } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { classNames } from '../../utils/classNames';
import { ChevronDownIcon, Icon } from '../Icon';
import styles from './Accordion.module.css';

export type AccordionVariant = 'bordered' | 'plain';
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AccordionItem {
  /** Unique value of the item; used by `value`, `defaultValue` and `onChange`. */
  value: string;
  /** Header text: a short noun phrase or question, in sentence case. It names the trigger. */
  title: string;
  /** Short mono text at the end of the header (a count, a date). Read after the title. */
  meta?: string;
  /** Content of the panel. It stays in the DOM while collapsed (hidden, but findable by the browser's find-in-page). */
  content: ReactNode;
  /** Disables the trigger of this item. */
  isDisabled?: boolean;
}

export interface AccordionProps extends Omit<
  DisclosureGroupProps,
  | 'className'
  | 'style'
  | 'children'
  | 'render'
  | 'allowsMultipleExpanded'
  | 'expandedKeys'
  | 'defaultExpandedKeys'
  | 'onExpandedChange'
> {
  /** The sections, in order. */
  items: readonly AccordionItem[];
  /**
   * Allow several sections open at once. By default opening one section closes the others
   * (single expansion).
   */
  multiple?: boolean;
  /** Values of the expanded items (controlled). */
  value?: readonly string[];
  /** Values of the items expanded at first (uncontrolled). */
  defaultValue?: readonly string[];
  /** Called with the values of all expanded items after the user toggles one. */
  onChange?: (value: string[]) => void;
  /** `bordered` (default) draws a card around the sections; `plain` only draws dividers. */
  variant?: AccordionVariant;
  /**
   * Level of the heading that wraps each trigger, `3` by default. Use the level that follows
   * the heading above the accordion in the page outline.
   */
  headingLevel?: AccordionHeadingLevel;
  /** Disables every section. */
  isDisabled?: boolean;
  className?: string;
  /** Ref to the root element. */
  ref?: Ref<HTMLDivElement>;
}

const NONE: readonly string[] = [];

/**
 * A stack of sections that expand and collapse. Each header is a heading that wraps a real
 * button (`aria-expanded`, `aria-controls`), so it appears in the page outline and works with
 * `Enter` and `Space`. Built on React Aria `DisclosureGroup`.
 *
 * Use it to shorten a long page of related, optional content (FAQs, settings groups). Do not
 * hide content people need to finish their task.
 */
export function Accordion({
  items,
  multiple = false,
  value,
  defaultValue = NONE,
  onChange,
  variant = 'bordered',
  headingLevel = 3,
  isDisabled = false,
  className,
  ...rest
}: AccordionProps) {
  const [expanded, setExpanded] = useControllableState<readonly string[]>({
    value,
    defaultValue,
    onChange: onChange
      ? (next) => {
          onChange([...next]);
        }
      : undefined,
  });
  return (
    <DisclosureGroup
      {...rest}
      allowsMultipleExpanded={multiple}
      expandedKeys={expanded}
      onExpandedChange={(keys) => {
        setExpanded([...keys].map(String));
      }}
      isDisabled={isDisabled}
      className={classNames(styles.root, className)}
      data-variant={variant}
    >
      {items.map((item) => (
        <Disclosure
          key={item.value}
          id={item.value}
          isDisabled={item.isDisabled === true}
          className={classNames(styles.item)}
        >
          <Heading level={headingLevel} className={classNames(styles.heading)}>
            <Button slot="trigger" className={classNames(styles.trigger)}>
              <Icon icon={ChevronDownIcon} size="sm" className={styles.chevron} />
              <span className={styles.title}>{item.title}</span>
              {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
            </Button>
          </Heading>
          <DisclosurePanel>
            <div className={styles.content}>{item.content}</div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
