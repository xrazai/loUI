import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Avatar } from '../Avatar';
import type { IconComponent } from '../Icon';
import { NavItem } from '../NavItem';
import type { NavItemTone } from '../NavItem';
import { messages } from './Sidebar.messages';
import styles from './Sidebar.module.css';

export interface SidebarWorkspace {
  /** Name of the workspace, product or company. */
  name: string;
  /** Second line under the name, for example the plan or environment. */
  subtitle?: string;
  /** Letter shown in the tile. Defaults to the first letter of `name`. */
  initial?: string;
}

export interface SidebarItem {
  /** Unique value; matches `Sidebar`'s `value` to mark the active item and is passed to `onChange`. */
  value: string;
  /** Label of the item. */
  label: string;
  /** Destination. Without it the item is a button and only `onChange` runs. */
  href?: string;
  /** Icon from the curated set. */
  icon?: IconComponent;
  /** Count shown in a pill. */
  count?: number | string;
  /** Spoken text for the count ("3 pending"). Always set it with `count`. */
  countLabel?: string;
  /** Tone of the count pill. */
  countTone?: NavItemTone;
  /** Disables the item. */
  isDisabled?: boolean;
}

interface SidebarSectionBase {
  /** Stable key of the section. */
  id: string;
  /** The items of the section, in order. */
  items: readonly SidebarItem[];
}

/** A section with a visible caption; the caption is also its accessible name. */
interface TitledSection extends SidebarSectionBase {
  /** Caption of the section (mono, uppercase by CSS). Write it in sentence case. */
  title: string;
  /** Accessible name when it must differ from the caption. */
  label?: string;
}

/** A section without a caption: an accessible name is required. */
interface UntitledSection extends SidebarSectionBase {
  title?: undefined;
  /** Accessible name of the navigation landmark ("Account"). */
  label: string;
}

export type SidebarSection = TitledSection | UntitledSection;

export interface SidebarStatus {
  /** Meaning of the dot: `neutral` (default, grey: no judgement), `success`, `warning` or `danger`. */
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  /** The status in words ("All systems operational"). The dot only reinforces it. */
  title: string;
  /** Left text of the detail line ("Last sync"). */
  meta?: string;
  /** Right text of the detail line, in mono ("2 min ago"). */
  value?: string;
}

export interface SidebarUser {
  /** Full name of the signed-in person. */
  name: string;
  /** Role or email under the name. */
  role?: string;
  /** Photo URL. Falls back to the initials. */
  avatarSrc?: string;
}

export interface SidebarProps extends Omit<
  ComponentPropsWithRef<'aside'>,
  'children' | 'onChange' | 'aria-label'
> {
  /** The workspace block at the top. */
  workspace: SidebarWorkspace;
  /** Navigation groups. Each one is its own labelled `nav` landmark. */
  sections: readonly SidebarSection[];
  /** `value` of the active item (gets `aria-current="page"`). */
  value?: string;
  /** Called with the `value` of the item the user pressed. */
  onChange?: (value: string) => void;
  /** Optional status card above the footer. */
  status?: SidebarStatus;
  /** Free slot above the user block, for example a help link or an upgrade note. */
  footer?: ReactNode;
  /** The signed-in user, at the bottom. */
  user?: SidebarUser;
  /** Overrides the accessible name of the landmark (default "Sidebar" from the catalog). */
  'aria-label'?: string;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

function SidebarNavigation({
  section,
  value,
  onChange,
}: {
  section: SidebarSection;
  value: string | undefined;
  onChange: ((value: string) => void) | undefined;
}) {
  const titleId = useId();
  const labelProps =
    section.title !== undefined && section.label === undefined
      ? { 'aria-labelledby': titleId }
      : { 'aria-label': section.label ?? '' };
  return (
    <nav {...labelProps} className={styles.section}>
      {section.title === undefined ? null : (
        <div id={titleId} className={styles.caption}>
          {section.title}
        </div>
      )}
      <ul className={styles.list}>
        {section.items.map((item) => (
          <li key={item.value}>
            <NavItem
              {...(item.href === undefined ? {} : { href: item.href })}
              {...(item.icon === undefined ? {} : { icon: item.icon })}
              {...(item.count === undefined ? {} : { count: item.count })}
              {...(item.countLabel === undefined ? {} : { countLabel: item.countLabel })}
              {...(item.countTone === undefined ? {} : { countTone: item.countTone })}
              {...(item.isDisabled === undefined ? {} : { isDisabled: item.isDisabled })}
              isActive={item.value === value}
              onPress={() => {
                onChange?.(item.value);
              }}
            >
              {item.label}
            </NavItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The app sidebar: a workspace block, navigation sections, an optional status card, a footer
 * slot and the signed-in user. It is an `aside` landmark; each section is a separate `nav`
 * landmark named by its caption. It is `--ds-sidebar-w` wide and scrolls on its own when it is
 * taller than its container, so give the parent a fixed height.
 *
 * Reading order and focus order follow the visual order: sections top to bottom, then the
 * footer. Collapsing or an off-canvas mobile variant is not part of this component.
 */
export function Sidebar({
  workspace,
  sections,
  value,
  onChange,
  status,
  footer,
  user,
  'aria-label': ariaLabel,
  messages: overrides,
  className,
  ...rest
}: SidebarProps) {
  const t = useMessages('Sidebar', messages, overrides);
  const locale = useDSLocale();
  const initial =
    workspace.initial ?? Array.from(workspace.name.trim())[0]?.toLocaleUpperCase(locale) ?? '';
  const statusTone = status?.tone ?? 'neutral';
  const hasBottom = status !== undefined || footer !== undefined || user !== undefined;

  return (
    <aside
      {...rest}
      aria-label={ariaLabel ?? t.label}
      className={classNames(styles.root, className)}
    >
      <div className={styles.workspace}>
        <span className={styles.mark} aria-hidden="true">
          {initial}
        </span>
        <div className={styles.workspaceText}>
          <span className={styles.workspaceName}>{workspace.name}</span>
          {workspace.subtitle ? (
            <span className={styles.workspaceSubtitle}>{workspace.subtitle}</span>
          ) : null}
        </div>
      </div>

      {sections.map((section) => (
        <SidebarNavigation key={section.id} section={section} value={value} onChange={onChange} />
      ))}

      {hasBottom ? (
        <div className={styles.bottom}>
          {status ? (
            <div role="status" className={styles.status}>
              <div className={styles.statusTitle}>
                <span className={styles.dot} data-tone={statusTone} aria-hidden="true" />
                {status.title}
              </div>
              {status.meta || status.value ? (
                <div className={styles.statusDetail}>
                  <span>{status.meta}</span>
                  <span className={styles.statusValue}>{status.value}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          {footer}
          {user ? (
            <div className={styles.user}>
              <Avatar
                decorative
                name={user.name}
                size="md"
                {...(user.avatarSrc === undefined ? {} : { src: user.avatarSrc })}
              />
              <div className={styles.userText}>
                <span className={styles.userName}>{user.name}</span>
                {user.role ? <span className={styles.userRole}>{user.role}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
