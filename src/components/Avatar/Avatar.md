# Avatar

Status: experimental

A circular photo or the initials of a person, in grays. There is no color per person.

## When to use

- Identify who owns, created or is assigned to something.
- Next to a name in a list, a comment or a menu.

## When not to use

- For a company logo or a product thumbnail: use an image.
- For a status: use `Badge`.

## Anatomy

```
span.root (circle, role="img" + aria-label when it initials)
  img | span[aria-hidden] initials
```

## Props

| Prop         | Type                   | Default | Notes                                                                                  |
| ------------ | ---------------------- | ------- | -------------------------------------------------------------------------------------- |
| `name`       | `string`               | -       | Required unless `decorative`. Drives the initials and the accessible name              |
| `src`        | `string`               |         | Photo URL. A load error falls back to the initials                                     |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`  | 24, 28 and 40 px (`--ds-avatar-size-*`)                                                |
| `ring`       | `boolean`              | `false` | 2px surface-colored ring, to separate overlapping avatars                              |
| `decorative` | `boolean`              | `false` | Hides the avatar from assistive technology (`alt=""`). Use it next to the visible name |

The type makes `name` required when the avatar is not decorative. Other `span` attributes and `ref` go to the root.

## Initials

`getInitials(name, locale)` (also exported) takes the first letter of the first and of the last word: "Ana Maria da Silva" is `AS`; a single word gives one letter. It uses `Intl.Segmenter` (combined characters stay whole) and `toLocaleUpperCase` with the `DSProvider` locale (`i` becomes `İ` in Turkish). The gray shade is derived from the name, so one person always looks the same.

## Accessibility

- With initials the root is `role="img"` named by `name`; the letters are `aria-hidden` so they are not read twice.
- With a photo the `<img>` has `alt={name}`. A decorative avatar has `alt=""` and no role.
- The handoff set `alt` to the initials ("AL"), which is meaningless to a screen reader; the full name is used now.
- If the image cannot be loaded the initials appear and the accessible name stays the same.
- Avatars are not interactive. Put one inside a button or link that has its own name and mark it `decorative`.

## Content rules

- Pass the full display name, not the initials.
- Never pass an email or an id as `name`.

## Examples

```tsx
<Avatar name="Ada Lovelace" />
<Avatar name="Ada Lovelace" src="/photos/ada.jpg" size="lg" />
<Avatar decorative name="Ada Lovelace" /> <span>Ada Lovelace</span>
```

Stacked avatars: wrap them in a flex container with `role="group"` and an `aria-label`, give each `ring`, and overlap with a negative inline margin. A dedicated `AvatarGroup` is not part of this version.

## Differences from the handoff

- `name` replaces `initials`; initials are computed and locale-aware.
- `alt` is the person's name, or empty when `decorative`.
- Image error fallback.
- `size` is `sm | md | lg` (tokens) instead of a number; `tone` and `ring` color props are gone (shade is derived from the name, ring is a boolean).
- No `style` prop.
