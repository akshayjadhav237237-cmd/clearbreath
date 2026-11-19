/** Triggers a browser file download using an object URL that is immediately revoked. */
export function triggerBlobDownload(
  filename: string,
  content: string,
  mimeType: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.URL?.revokeObjectURL === 'function'
    ) {
      window.URL.revokeObjectURL(objectUrl);
    }
  }, 100);
}
