import type { Translation, LangCode } from '../types/common';

/**
 * Resolve a Translation to a display string.
 * Fallback order: selected lang → ENG → ARM → RUS → empty string.
 */
export function resolveTranslation(
  translation: Translation | null | undefined,
  lang: LangCode,
): string {
  if (!translation) return '';
  const selected = translation[lang];
  if (selected && selected.trim()) return selected;
  if (translation.ENG && translation.ENG.trim()) return translation.ENG;
  if (translation.ARM && translation.ARM.trim()) return translation.ARM;
  if (translation.RUS && translation.RUS.trim()) return translation.RUS;
  return '';
}

/** Build an empty Translation object. */
export function emptyTranslation(): Translation {
  return { ARM: '', ENG: '', RUS: '' };
}

/**
 * Extract a translation for a specific language WITHOUT fallback.
 * Use for filter/search operations.
 */
export function extractTranslation(
  translation: Translation | null | undefined,
  lang: LangCode,
): string {
  if (!translation) return '';
  return translation[lang] ?? '';
}
