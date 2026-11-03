import { useId } from 'react';
import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';
import { Link } from '../../components/Link';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './SourceList.messages';
import styles from './SourceList.module.css';

export interface Source {
  /** Stable, unique id of the source within the list. Citations point to it. */
  id: string;
  /** Title of the document or page. */
  title: string;
  /** Address of the source. Makes the title a link that opens in a new tab. */
  url?: string;
  /** Domain shown under the title. Defaults to the host of `url` without `www.`. */
  domain?: string;
  /** Short excerpt that supports the claim. Plain text. */
  snippet?: string;
}

export interface SourceListProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'children' | 'title' | 'id'
> {
  /** Id of the list. Required: citations use it to find their source. */
  id: string;
  /** The sources, in citation order. The first is source 1. */
  sources: readonly Source[];
  /** Heading text. Defaults to "Sources". */
  title?: string;
  /** Heading level of the title (`h1` to `h6`). Default `3`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/** The DOM id of one source of a list. `Citation` builds the same id from `listId` and `sourceId`. */
export function getSourceElementId(listId: string, sourceId: string): string {
  return `${listId}-source-${sourceId}`;
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/**
 * The numbered list of sources an answer is based on. Each source is a list item that
 * `Citation` markers jump to; the title is a link when the source has a `url`.
 *
 * Source numbers are the position in `sources`: keep the order stable while the answer streams,
 * and append new sources at the end.
 */
export function SourceList({
  id,
  sources,
  title,
  headingLevel = 3,
  messages: overrides,
  className,
  ...rest
}: SourceListProps) {
  const t = useMessages('SourceList', messages, overrides);
  const headingId = useId();
  const Heading = `h${String(headingLevel)}` as ElementType;
  return (
    <section
      {...rest}
      id={id}
      aria-labelledby={headingId}
      className={classNames(styles.root, className)}
    >
      <Heading id={headingId} className={styles.title}>
        {title ?? t.title}
      </Heading>
      <ol className={styles.list}>
        {sources.map((source) => {
          const domain = source.domain ?? (source.url ? hostOf(source.url) : undefined);
          return (
            <li
              key={source.id}
              id={getSourceElementId(id, source.id)}
              // Focus target of the citation markers; never reached by Tab.
              tabIndex={-1}
              className={styles.item}
            >
              <span className={styles.heading}>
                {source.url ? (
                  <Link variant="standalone" href={source.url} target="_blank">
                    {source.title}
                  </Link>
                ) : (
                  <span className={styles.plainTitle}>{source.title}</span>
                )}
              </span>
              {domain ? <span className={styles.domain}>{domain}</span> : null}
              {source.snippet ? <span className={styles.snippet}>{source.snippet}</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export interface CitationProps extends Omit<
  ComponentPropsWithRef<'a'>,
  'children' | 'href' | 'aria-label' | 'title'
> {
  /** Position of the source in the list, starting at 1. Shown as the marker text. */
  number: number;
  /** Title of the source. Part of the accessible name ("Source 2: Title"). */
  title: string;
  /** Id of the `SourceList` the source belongs to. */
  listId: string;
  /** Id of the source (`Source.id`). */
  sourceId: string;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

/**
 * An inline marker for a claim in an answer. It is a real link (`href="#..."`) that moves
 * focus to the matching source in the `SourceList`, so it works with a keyboard and a screen
 * reader: the name is "Source 2: Title", the visible text is the number.
 */
export function Citation({
  number,
  title,
  listId,
  sourceId,
  messages: overrides,
  className,
  onClick,
  ...rest
}: CitationProps) {
  const t = useMessages('SourceList', messages, overrides);
  const target = getSourceElementId(listId, sourceId);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const element = document.getElementById(target);
    if (!element) return;
    // Focus instead of changing the URL hash: the app's router owns the address bar.
    event.preventDefault();
    element.focus();
    element.scrollIntoView({ block: 'nearest' });
  }

  return (
    <a
      {...rest}
      href={`#${target}`}
      aria-label={t.citation(number, title)}
      className={classNames(styles.citation, className)}
      onClick={handleClick}
    >
      {number}
    </a>
  );
}
