# Avatar

> A circular photo or initials of a person, in grays (never a color per person). The `name`
> drives the initials and the accessible name; a photo that fails to load falls back to the
> initials.

A circular photo or the initials of a person, in grays. There is no color per person.

- Import: `import { Avatar } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Avatar/Avatar.tsx`
- Stories (Storybook title `Components/Avatar`): Default, Sizes, WithPhoto, BrokenPhoto, Decorative, Shades, Stacked, LongName, RightToLeft

## Props

| Prop         | Type                   | Required | Default | Description                                                                                                                             |
| ------------ | ---------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | `string`               |          |         | The person's full name. Drives the initials and the accessible name (`alt` of the photo). Optional: still used to compute the initials. |
| `decorative` | `boolean`              |          | `false` | Hides the avatar from assistive technology (`alt=""`). Use it when the name is shown next to it.                                        |
| `src`        | `string`               |          |         | URL of the photo. If it fails to load, the initials are shown instead.                                                                  |
| `size`       | `'sm' \| 'md' \| 'lg'` |          | `'md'`  | `sm` 24px, `md` 28px (default), `lg` 40px.                                                                                              |
| `ring`       | `boolean`              |          | `false` | Draws a 2px ring in the surface color, to separate overlapping avatars. Default `false`.                                                |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Design tokens used

`--ds-avatar-initials-ratio`, `--ds-avatar-ring-width`, `--ds-avatar-size-lg`, `--ds-avatar-size-md`, `--ds-avatar-size-sm`, `--ds-font-sans`, `--ds-line`, `--ds-line-strong`, `--ds-radius-pill`, `--ds-surface`, `--ds-surface-hover`, `--ds-text`, `--ds-weight-semibold`

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

## Related components

- Instead, see Badge: For a status: use `Badge`.
- Used by: Sidebar
