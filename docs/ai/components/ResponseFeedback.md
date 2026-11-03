# ResponseFeedback

> Feedback and follow-up actions under an assistant response: two toggle buttons (good and bad
> response, `aria-pressed`), then optional Copy and Regenerate.

Choosing a rating is reversible, so nothing asks to confirm: pressing the active rating again
removes it. A polite live region says "Feedback sent" or "Feedback removed" after the change.
The first render never announces anything. The buttons show text only for now: thumbs, copy
and refresh icons are not part of the curated icon set yet.

Feedback and follow-up actions under an assistant response: good and bad response toggles, then optional Copy and Regenerate. Import it from `loui-ds/patterns`.

- Import: `import { ResponseFeedback } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ResponseFeedback/ResponseFeedback.tsx`
- Stories (Storybook title `Patterns/ResponseFeedback`): Default, RatedBad, RatingOnly, Regenerating, Disabled, RightToLeft

## Props

| Prop             | Type                                                                                                                                    | Required | Default | Description                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `value`          | `ResponseRating \| null`                                                                                                                |          |         | Controlled rating. `null` means no rating.                                                        |
| `defaultValue`   | `ResponseRating \| null`                                                                                                                |          | `null`  | Initial rating when uncontrolled.                                                                 |
| `onChange`       | `(value: ResponseRating \| null) => void`                                                                                               |          |         | Called with the new rating, or `null` when the person takes their rating back.                    |
| `onCopy`         | `() => void`                                                                                                                            |          |         | Called when Copy is pressed. Without it there is no Copy button. Confirm with a toast ("Copied"). |
| `onRegenerate`   | `() => void`                                                                                                                            |          |         | Called when Regenerate is pressed. Without it there is no Regenerate button.                      |
| `isRegenerating` | `boolean`                                                                                                                               |          | `false` | Disables Regenerate while a new response is being generated.                                      |
| `isDisabled`     | `boolean`                                                                                                                               |          | `false` | Disables every button.                                                                            |
| `messages`       | `Partial<{ groupLabel: string; positive: string; negative: string; copy: string; regenerate: string; sent: string; removed: string; }>` |          |         | Override the built-in messages for this instance.                                                 |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ResponseFeedback: { ... } }}>`.

| Key          | English default       | Notes                                            |
| ------------ | --------------------- | ------------------------------------------------ |
| `groupLabel` | `Rate this response`  | Accessible name of the group of rating buttons.  |
| `positive`   | `Good response`       | Toggle buttons; pressed means the rating is set. |
| `negative`   | `Bad response`        |                                                  |
| `copy`       | `Copy response`       | Action buttons (verb plus object).               |
| `regenerate` | `Regenerate response` |                                                  |
| `sent`       | `Feedback sent`       | Polite announcements after a rating changes.     |
| `removed`    | `Feedback removed`    |                                                  |

## Design tokens used

`--ds-font-sans`, `--ds-line-subtle`, `--ds-response-feedback-divider-gap`, `--ds-response-feedback-gap`

## When to use

- Under each assistant response in a `ChatPanel`, to learn which answers help.

## When not to use

- Collecting a written review or a star rating: use `Rating` in a form.
- Anything that sends the rating somewhere the owner cannot see: say where it goes in your product.

## Anatomy

```
div
  group "Rate this response"   toggle "Good response" · toggle "Bad response"   (aria-pressed)
  button "Copy response"       only with onCopy
  button "Regenerate response" only with onRegenerate
  status                       visually hidden live region
```

## Accessibility

- The rating buttons are toggle buttons (`aria-pressed`) in a labelled group. Each is a tab stop; `Space` and `Enter` press.
- Rating is reversible, so nothing asks to confirm: pressing the active button again removes the rating.
- A polite live region says "Feedback sent" or "Feedback removed" after a change. It is silent on first render.
- Each control shows a decorative icon (`ThumbsUpIcon`, `ThumbsDownIcon`, `CopyIcon`, `RefreshIcon`) next to its visible text label; the text is the accessible name.

## Content rules

- Buttons are verb plus object ("Copy response", "Regenerate response").
- Confirm Copy with a short past-tense toast ("Copied"), outside this pattern.
- Regenerate replaces content: offer Undo, as for any reversible action.

## Example

```tsx
<ResponseFeedback
  onChange={(rating) => saveRating(message.id, rating)}
  onCopy={() => copyToClipboard(message.content)}
  onRegenerate={() => regenerate(message.id)}
  isRegenerating={busy}
/>
```

## Related components

- Instead, see Rating: Collecting a written review or a star rating: use `Rating` in a form.
- Renders: Button, Icon, Toggle, VisuallyHidden
