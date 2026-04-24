import type { DownloadLicenseResponse } from '../api/customers';

/**
 * Convert a DownloadLicenseResponse to the content string for basalt.ini.
 *
 * Format:
 *   additionalFields entries (name=value or value, skip if value is null/undefined)
 *   [GENERAL]
 *   key=value  (skip if value is null/undefined)
 *   [CUSTOM]
 *   key=value  (skip if value is null/undefined)
 */
export function generateLicenseFileContent(data: DownloadLicenseResponse): string {
  const lines: string[] = [];

  // --- additionalFields ---
  for (const field of data.additionalFields ?? []) {
    if (field.value === null || field.value === undefined) continue;
    if (field.addName) {
      lines.push(`${field.name}=${String(field.value)}`);
    } else {
      lines.push(String(field.value));
    }
  }

  // --- general ---
  lines.push('[GENERAL]');
  for (const [key, value] of Object.entries(data.general ?? {})) {
    if (value === null || value === undefined) continue;
    lines.push(`${key}=${String(value)}`);
  }

  // --- custom ---
  lines.push('[CUSTOM]');
  for (const [key, value] of Object.entries(data.custom ?? {})) {
    if (value === null || value === undefined) continue;
    lines.push(`${key}=${String(value)}`);
  }

  return lines.join('\n');
}

/** Trigger a browser download of text content as the given filename. */
export function triggerTextDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
