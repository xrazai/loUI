# ResponseFeedback

Status: experimental

Feedback and follow-up actions under an assistant response: good and bad response toggles, then optional Copy and Regenerate. Import it from `loui-ds/patterns`.

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

## Props

| Prop                     | Type                               | Default | Notes                                                                          |
| ------------------------ | ---------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `value` / `defaultValue` | `'positive' \| 'negative' \| null` | `null`  | Controlled or uncontrolled rating.                                             |
| `onChange`               | `(value \| null) => void`          |         | `null` when the person takes the rating back.                                  |
| `onCopy`                 | `() => void`                       |         | Shows Copy. Copy the text yourself, then confirm with a toast.                 |
| `onRegenerate`           | `() => void`                       |         | Shows Regenerate.                                                              |
| `isRegenerating`         | `boolean`                          | `false` | Disables Regenerate while the new response is generated.                       |
| `isDisabled`             | `boolean`                          | `false` | Disables every button.                                                         |
| `messages`               | partial catalog                    |         | `groupLabel`, `positive`, `negative`, `copy`, `regenerate`, `sent`, `removed`. |

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

## Differences from the handoff

No handoff source: new pattern (TODO `AI-013`).
