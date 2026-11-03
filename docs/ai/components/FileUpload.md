# FileUpload

> A drop zone with a "Choose files" button and the list of added files (React Aria `DropZone`
> and `FileTrigger`). Dragging is a pointer shortcut; the button is the keyboard and click way
> in. Files are validated (type, size, count) as they arrive and the errors are shown under the
> zone; added, removed and rejected files are announced politely. The component keeps no upload
> state: pass `progress` to show a bar per file.

A drop zone with a "Choose files" button and the list of added files. Built on React Aria `DropZone` and `FileTrigger`; progress bars use [Progress](../Progress/Progress.md). The component validates and lists files; it uploads nothing. Task: CMP-INP-03.

- Import: `import { FileUpload } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/FileUpload/FileUpload.tsx`
- Stories (Storybook title `Components/FileUpload`): Default, WithFiles, Validation, SingleFile, WithProgress, Disabled, LongFileName

## Props

| Prop              | Type                                                                                                                                                                                                                                                           | Required | Default | Description                                                                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | `ReactNode`                                                                                                                                                                                                                                                    |          |         | Helper text under the drop zone, for the rules: "PNG, JPG or PDF up to 10 MB". Linked to the zone.                                                                                                                                 |
| `accept`          | `readonly string[]`                                                                                                                                                                                                                                            |          |         | Accepted types: MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`). Files of other types are rejected with an error message. Also filters the file dialog.                                                     |
| `maxSize`         | `number`                                                                                                                                                                                                                                                       |          |         | Largest file in bytes. Larger files are rejected with an error message.                                                                                                                                                            |
| `maxFiles`        | `number`                                                                                                                                                                                                                                                       |          |         | Most files in the list. `1` switches to single-file mode: choosing or dropping a file replaces the current one. Default: no limit.                                                                                                 |
| `value`           | `readonly File[]`                                                                                                                                                                                                                                              |          |         | The files, when controlled. Pair with `onChange`.                                                                                                                                                                                  |
| `defaultValue`    | `readonly File[]`                                                                                                                                                                                                                                              |          |         | The initial files when uncontrolled.                                                                                                                                                                                               |
| `onChange`        | `((files: File[]) => void)`                                                                                                                                                                                                                                    |          |         | Called with the full list after files are added or removed.                                                                                                                                                                        |
| `onReject`        | `((rejections: FileRejection[]) => void)`                                                                                                                                                                                                                      |          |         | Called with the files that were not added and why (wrong type, too large, too many).                                                                                                                                               |
| `progress`        | `ReadonlyMap<File, number>`                                                                                                                                                                                                                                    |          |         | Upload progress per file, 0 to 100, supplied by you (the component uploads nothing and never invents progress). A file with a value under 100 shows a progress bar; 100 shows "Done"; a file without an entry shows only its size. |
| `name`            | `string`                                                                                                                                                                                                                                                       |          |         | Name for form submission: the selected files are submitted as `File` entries under this name (multiple entries when several files).                                                                                                |
| `isDisabled`      | `boolean`                                                                                                                                                                                                                                                      |          | `false` | Disables choosing, dropping and removing.                                                                                                                                                                                          |
| `className`       | `string`                                                                                                                                                                                                                                                       |          |         | Class name for the root.                                                                                                                                                                                                           |
| `messages`        | `Partial<{ dropZone: string; dropLabel: (multiple: boolean) => string; choose: (multiple: boolean) => string; listLabel: string; remove: (name: string) => string; uploading: (name: string) => string; ... 9 more ...; removed: (name: string) => string; }>` |          |         | Message overrides for this instance.                                                                                                                                                                                               |
| `ref`             | `Ref<HTMLDivElement>`                                                                                                                                                                                                                                          |          |         | Ref to the root `<div>`.                                                                                                                                                                                                           |
| `label`           | `ReactNode`                                                                                                                                                                                                                                                    |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                                |
| `aria-label`      | `string`                                                                                                                                                                                                                                                       |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                            |
| `aria-labelledby` | `string`                                                                                                                                                                                                                                                       |          |         | Id of the element that names the field.                                                                                                                                                                                            |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ FileUpload: { ... } }}>`.

| Key                                     | English default                           | Notes                                                                                                        |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `dropZone`                              | `Drop zone`                               | Accessible name of the drop target itself (React Aria adds a keyboard stop on it that accepts pasted files). |
| `dropLabel(multiple: boolean)`          | `Drop a file here`                        | Text of the drop target, which names it for assistive technology.                                            |
| `choose(multiple: boolean)`             | `Choose a file`                           | The button that opens the file dialog (the keyboard and click alternative to dragging).                      |
| `listLabel`                             | `Added files`                             | Accessible name of the list of added files.                                                                  |
| `remove(name: string)`                  | `Remove {name}`                           | Accessible name of the remove button of a file.                                                              |
| `uploading(name: string)`               | `Uploading {name}`                        | Accessible name of the progress bar of a file that is uploading.                                             |
| `done`                                  | `Done`                                    | Status text of a file whose progress reached 100.                                                            |
| `unitB`                                 | `B`                                       | Size units shown after the number.                                                                           |
| `unitKB`                                | `KB`                                      |                                                                                                              |
| `unitMB`                                | `MB`                                      |                                                                                                              |
| `unitGB`                                | `GB`                                      |                                                                                                              |
| `wrongType(name: string)`               | `"{name}" is not an accepted file type.`  | Error: the file type is not accepted.                                                                        |
| `tooLarge(name: string, max: string)`   | `"{name}" is larger than {max}.`          | Error: the file is larger than the limit (already formatted, e.g. "10 MB").                                  |
| `tooMany(max: number, skipped: number)` | `Only 2 files can be added. 2 not added.` | Error: files over the count limit were not added.                                                            |
| `added(n: number)`                      | `2 files added`                           | Live announcement after files were added.                                                                    |
| `removed(name: string)`                 | `Removed {name}`                          | Live announcement after a file was removed.                                                                  |

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-bg`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-file-upload-dropzone-padding-block`, `--ds-file-upload-dropzone-padding-inline`, `--ds-file-upload-item-padding-block`, `--ds-file-upload-item-padding-inline`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-space-2`, `--ds-space-3`, `--ds-success`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

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

## Manual verification

Dropping files is automated: `FileUpload.test.tsx` performs a native drag of real files through the Chrome DevTools Protocol (`commands.dropFiles`, defined in `tests/browser-commands`), because React Aria rejects synthetic `DragEvent`s. Pasting is not automatable, so check it by hand before a release that touches this component (TEST-017):

1. Copy a file in the operating system file manager (Explorer, Finder), or copy an image.
2. Tab to the drop zone (the first stop, named "Drop zone") so it has focus.
3. Press `Ctrl+V` (`Cmd+V` on macOS). The file should be added to the list and announced ("1 file added.").
4. Repeat with Chrome, Firefox and Safari. Record any browser where the file is not added.

Why it cannot be automated: the paste handler of React Aria reads each item through `webkitGetAsEntry()`, which returns `null` for a synthetic `DataTransfer` and for an image written to the clipboard by a script (verified in Chromium: `kind: file`, `type: image/png`, entry `null`), so the item is skipped. Only a file copied by the operating system can be tested, and no browser API can put one on the clipboard.

## Related components

- Renders: Button, Description, IconButton, Progress, VisuallyHidden
