import { useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { useDSLocale } from '../../i18n';
import { classNames } from '../../utils/classNames';
import styles from './Avatar.module.css';
import { getInitials } from './getInitials';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarBaseProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** URL of the photo. If it fails to load, the initials are shown instead. */
  src?: string;
  /** `sm` 24px, `md` 28px (default), `lg` 40px. */
  size?: AvatarSize;
  /** Draws a 2px ring in the surface color, to separate overlapping avatars. Default `false`. */
  ring?: boolean;
}

/** An avatar that identifies a person: `name` is required and becomes the accessible name. */
interface NamedAvatarProps extends AvatarBaseProps {
  /** The person's full name. Drives the initials and the accessible name (`alt` of the photo). */
  name: string;
  decorative?: false;
}

/** An avatar that repeats information already on screen (for example next to the name). */
interface DecorativeAvatarProps extends AvatarBaseProps {
  /** Hides the avatar from assistive technology (`alt=""`). Use it when the name is shown next to it. */
  decorative: true;
  /** Optional: still used to compute the initials. */
  name?: string;
}

export type AvatarProps = NamedAvatarProps | DecorativeAvatarProps;

/** Deterministic gray shade (0 to 2) so the same person always gets the same background. */
function shadeOf(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return sum % 3;
}

/**
 * A circular photo or initials of a person, in grays (never a color per person). The `name`
 * drives the initials and the accessible name; a photo that fails to load falls back to the
 * initials.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  ring = false,
  decorative = false,
  className,
  ...rest
}: AvatarProps) {
  const locale = useDSLocale();
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const showImage = src !== undefined && src !== '' && failedSrc !== src;
  const label = name ?? '';
  const common = {
    ...rest,
    className: classNames(styles.root, className),
    'data-size': size,
    'data-shade': shadeOf(label),
    'data-ring': ring || undefined,
  };

  if (showImage) {
    return (
      <span {...common}>
        <img
          className={styles.image}
          src={src}
          alt={decorative ? '' : label}
          onError={() => {
            setFailedSrc(src);
          }}
        />
      </span>
    );
  }

  const semantics = decorative ? {} : ({ role: 'img', 'aria-label': label } as const);
  return (
    <span {...common} {...semantics}>
      <span aria-hidden="true">{getInitials(label, locale)}</span>
    </span>
  );
}
