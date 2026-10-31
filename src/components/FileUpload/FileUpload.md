# FileUpload

A drop zone with a "Choose files" button and the list of added files. Built on React Aria `DropZone` and `FileTrigger`; progress bars use [Progress](../Progress/Progress.md). The component validates and lists files; it uploads nothing. Task: CMP-INP-03.

## When to use

- Attaching one or several files to a record or form.

## When not to use

- Image galleries, cropping or previews: a product pattern.
- A hidden uploader inside a button: use `FileTrigger` from React Aria directly.

## Props (key ones)

| Prop                                         | Notes                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`   | One is required. The root is a `group` named by it.                                                                                                         |
| `description`                                | The rules in words ("PNG, JPG or PDF up to 10 MB"), linked to the zone.                                                                                     |
| `accept`                                     | MIME types, wildcards (`image/*`) or extensions (`.pdf`). Also filters the file dialog.                                                                     |
| `maxSize`                                    | Bytes. Larger files are rejected.                                                                                                                           |
| `maxFiles`                                   | Count. `1` is single-file mode: a new file replaces the current one.                                                                                        |
| `value` / `defaultValue` / `onChange(files)` | The full `File[]` after every add or remove.                                                                                                                |
| `onReject(rejections)`                       | `{ file, reason: 'type' \| 'size' \| 'count' }[]` for files not added.                                                                                      |
| `progress`                                   | `Map<File, number>` (0 to 100), yours. Under 100 shows a bar, 100 shows "Done", no entry shows only the size.                                               |
| `name`                                       | Submits the files with the form (`FormData.getAll(name)` returns `File`s) through a hidden file input.                                                      |
| `isDisabled`, `className`, `ref`, `messages` | `messages`: `dropZone`, `dropLabel`, `choose`, `listLabel`, `remove`, `uploading`, `done`, `unit*`, `wrongType`, `tooLarge`, `tooMany`, `added`, `removed`. |

## Behavior

- Errors are listed under the zone and replaced on the next add or removal. Sizes are formatted with `formatNumber` for the locale and unit messages (`1.5 MB`, pt-BR `1,5 MB`; steps of 1024).
- Polite live region (`role="status"`) announces "2 files added" (with the error texts), "Removed name.pdf". Pluralized per locale.
- Each file row: name (truncated), size or "Done · size", and a ghost button "Remove {name}".
- `progress` is never simulated by the component. The handoff's random progress exists only in the "WithProgress" story, driven by a timer.

## Accessibility and keyboard

| Key                         | Behavior                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `Tab`                       | Zone (React Aria's own stop: `Ctrl/Cmd+V` pastes files there), Choose button, Remove buttons |
| `Enter` / `Space` on Choose | Opens the file dialog: the keyboard and click alternative to dragging                        |
| `Enter` / `Space` on Remove | Removes the file                                                                             |

Dragging is only a pointer shortcut; nothing depends on it. While files are dragged over it the zone gets an accent border and soft fill (also an outline in forced colors). The list is a `ul` named "Added files".

## Content rules

`description` states the limits in one sentence. Error texts name the file and the limit and are produced from messages ("\"big.pdf\" is larger than 1 MB.").

## Example

```tsx
<FileUpload
  label="Attachments"
  description="PDF up to 10 MB."
  accept={['.pdf']}
  maxSize={10 * 1024 * 1024}
  name="attachments"
  value={files}
  onChange={setFiles}
  progress={progress}
/>
```

## Differences from the handoff

- Real validation (type, size, count) with messages, a keyboard-operable button instead of a `div role="button"`, live announcements, controlled value, form submission, and consumer-supplied progress.
- Sizes and messages come from `Intl` and the catalog (the handoff hard-coded pt-BR and a comma).
- Not verified in automated tests: the drag-and-drop gesture itself and pasting (React Aria's drop handling rejects synthetic `DragEvent`s in Chromium); the shared `addFiles` path is covered through the file dialog.
