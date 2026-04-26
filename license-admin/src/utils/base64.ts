/**
 * Safely decode a base64 string.
 * Returns the decoded text or an error message.
 */
export function safeDecodeBase64(encoded: string): { text: string; error?: string } {
  try {
    return { text: atob(encoded) };
  } catch (e) {
    return { text: '', error: `Base64 decode error: ${String(e)}` };
  }
}

/**
 * Safely decode a base64 string and parse the result as JSON.
 * Use only for endpoints that return base64-encoded JSON (e.g. request license).
 */
export function safeDecodeBase64Json(encoded: string): {
  json: unknown | null;
  text: string;
  error?: string;
} {
  const { text, error: decodeError } = safeDecodeBase64(encoded);
  if (decodeError) return { json: null, text: '', error: decodeError };
  try {
    const json = JSON.parse(text);
    return { json, text };
  } catch (e) {
    return { json: null, text, error: `JSON parse error: ${String(e)}` };
  }
}
