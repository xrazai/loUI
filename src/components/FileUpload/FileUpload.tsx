import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { DropZone, FileTrigger, Text } from 'react-aria-components';
import type { DropZoneProps } from 'react-aria-components';

type DropEvent = Parameters<NonNullable<DropZoneProps['onDrop']>>[0];
import { useControllableState } from '../../hooks/useControllableState';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { Button } from '../Button';
import { Description } from '../Field';
import type { FieldLabelingProps } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { XIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { Progress } from '../Progress';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './FileUpload.messages';
import styles from './FileUpload.module.css';
import { splitSize, validateFiles } from './FileUpload.validation';
import type { FileRejection } from './FileUpload.validation';

export type FileUploadMessages = Partial<typeof messages.en>;

interface FileUploadBaseProps {
  /** Helper text under the drop zone, for the rules: "PNG, JPG or PDF up to 10 MB". Linked to the zone. */
  description?: ReactNode;
  /**
   * Accepted types: MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`).
   * Files of other types are rejected with an error message. Also filters the file dialog.
   */
  accept?: readonly string[] | undefined;
  /** Largest file in bytes. Larger files are rejected with an error message. */
  maxSize?: number | undefined;
  /**
   * Most files in the list. `1` switches to single-file mode: choosing or dropping a file
   * replaces the current one. Default: no limit.
   */
  maxFiles?: number | undefined;
  /** The files, when controlled. Pair with `onChange`. */
  value?: readonly File[] | undefined;
  /** The initial files when uncontrolled. */
  defaultValue?: readonly File[] | undefined;
  /** Called with the full list after files are added or removed. */
  onChange?: ((files: File[]) => void) | undefined;
  /** Called with the files that were not added and why (wrong type, too large, too many). */
  onReject?: ((rejections: FileRejection[]) => void) | undefined;
  /**
   * Upload progress per file, 0 to 100, supplied by you (the component uploads nothing and
   * never invents progress). A file with a value under 100 shows a progress bar; 100 shows
   * "Done"; a file without an entry shows only its size.
   */
  progress?: ReadonlyMap<File, number> | undefined;
  /**
   * Name for form submission: the selected files are submitted as `File` entries under this name
   * (multiple entries when several files).
   */
  name?: string | undefined;
  /** Disables choosing, dropping and removing. */
  isDisabled?: boolean | undefined;
  /** Class name for the root. */
  className?: string | undefined;
  /** Message overrides for this instance. */
  messages?: FileUploadMessages | undefined;
  /** Ref to the root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type FileUploadProps = FileUploadBaseProps & FieldLabelingProps;

function fileKey(file: File, index: number): string {
  return `${String(index)}:${file.name}:${String(file.size)}:${String(file.lastModified)}`;
}

/**
 * A drop zone with a "Choose files" button and the list of added files (React Aria `DropZone`
 * and `FileTrigger`). Dragging is a pointer shortcut; the button is the keyboard and click way
 * in. Files are validated (type, size, count) as they arrive and the errors are shown under the
 * zone; added, removed and rejected files are announced politely. The component keeps no upload
 * state: pass `progress` to show a bar per file.
 */
export function FileUpload({
  label,
  description,
  accept,
  maxSize,
  maxFiles,
  value,
  defaultValue,
  onChange,
  onReject,
  progress,
  name,
  isDisabled = false,
  className,
  messages: overrides,
  ref,
  ...rest
}: FileUploadProps) {
  warnMissingName('FileUpload', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('FileUpload', messages, overrides);
  const locale = useDSLocale();
  const labelId = useId();
  const descriptionId = useId();
  const multiple = maxFiles !== 1;
  const [files, setFiles] = useControllableState<readonly File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onChange as ((files: readonly File[]) => void) | undefined,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  const formatSize = (bytes: number): string => {
    const { value: amount, unit } = splitSize(bytes);
    const unitText = { B: t.unitB, KB: t.unitKB, MB: t.unitMB, GB: t.unitGB }[unit];
    const formatted = formatNumber(amount, locale, { maximumFractionDigits: unit === 'B' ? 0 : 1 });
    return `${formatted} ${unitText}`;
  };

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const { accepted, rejected } = validateFiles(files, incoming, { accept, maxSize, maxFiles });
    const messagesForErrors: string[] = [];
    let skipped = 0;
    for (const { file, reason } of rejected) {
      if (reason === 'type') messagesForErrors.push(t.wrongType(file.name));
      else if (reason === 'size')
        messagesForErrors.push(t.tooLarge(file.name, formatSize(maxSize ?? 0)));
      else skipped += 1;
    }
    if (skipped > 0 && maxFiles !== undefined) messagesForErrors.push(t.tooMany(maxFiles, skipped));
    setErrors(messagesForErrors);
    if (rejected.length > 0) onReject?.(rejected);
    const parts: string[] = [];
    if (accepted.length > 0) {
      setFiles(maxFiles === 1 ? accepted : [...files, ...accepted]);
      parts.push(`${t.added(accepted.length)}.`);
    }
    setAnnouncement([...parts, ...messagesForErrors].join(' '));
  };

  const remove = (file: File) => {
    setFiles(files.filter((entry) => entry !== file));
    setErrors([]);
    setAnnouncement(t.removed(file.name));
  };

  const onDrop = async (event: DropEvent) => {
    const dropped = await Promise.all(
      event.items.flatMap((item) => (item.kind === 'file' ? [item.getFile()] : [])),
    );
    addFiles(dropped);
  };

  // A hidden native input carries the files into form submission (FormData / native submit).
  const formInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = formInput.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files]);

  return (
    <div
      {...(rest['aria-label'] ? { 'aria-label': rest['aria-label'] } : {})}
      {...(rest['aria-labelledby'] ? { 'aria-labelledby': rest['aria-labelledby'] } : {})}
      {...(label ? { 'aria-labelledby': labelId } : {})}
      role="group"
      ref={ref}
      data-disabled={isDisabled || undefined}
      className={classNames(fieldStyles.root, styles.root, className)}
    >
      {label ? (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      ) : null}
      <DropZone
        isDisabled={isDisabled}
        aria-label={t.dropZone}
        className={classNames(styles.zone)}
        onDrop={(event) => {
          void onDrop(event);
        }}
        {...(description ? { 'aria-describedby': descriptionId } : {})}
      >
        <Text slot="label" className={styles.dropLabel}>
          {t.dropLabel(multiple)}
        </Text>
        <FileTrigger
          allowsMultiple={multiple}
          {...(accept && accept.length > 0 ? { acceptedFileTypes: accept } : {})}
          onSelect={(list) => {
            addFiles(list ? [...list] : []);
          }}
        >
          <Button variant="secondary" isDisabled={isDisabled}>
            {t.choose(multiple)}
          </Button>
        </FileTrigger>
      </DropZone>
      {description ? (
        <Description>
          <span id={descriptionId}>{description}</span>
        </Description>
      ) : null}
      {errors.length > 0 ? (
        <div className={styles.errors}>
          {errors.map((message) => (
            <p key={message} className={styles.error}>
              {message}
            </p>
          ))}
        </div>
      ) : null}
      {files.length > 0 ? (
        <ul className={styles.list} aria-label={t.listLabel}>
          {files.map((file, index) => {
            const percent = progress?.get(file);
            const uploading = percent !== undefined && percent < 100;
            return (
              <li key={fileKey(file, index)} className={styles.item}>
                <div className={styles.row}>
                  <span className={styles.name}>{file.name}</span>
                  <span className={styles.status} data-done={percent === 100 || undefined}>
                    {percent === undefined || uploading
                      ? formatSize(file.size)
                      : `${t.done} · ${formatSize(file.size)}`}
                  </span>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={XIcon}
                    label={t.remove(file.name)}
                    isDisabled={isDisabled}
                    onPress={() => {
                      remove(file);
                    }}
                  />
                </div>
                {uploading ? (
                  <Progress aria-label={t.uploading(file.name)} value={percent} showValue />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      {name ? (
        <input ref={formInput} type="file" name={name} hidden multiple tabIndex={-1} />
      ) : null}
    </div>
  );
}
