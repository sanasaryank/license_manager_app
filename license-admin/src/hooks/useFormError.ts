import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeError } from '../api/errorNormalizer';

export function useFormError(error: unknown) {
  const { t } = useTranslation();

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const normalized = normalizeError(error);
    // Try to resolve translation key, fallback to raw message
    const tryT = (key: string) => {
      const result = t(key);
      return result === key ? null : result;
    };
    return tryT(`errors.${normalized.message}`) ?? normalized.message;
  }, [error, t]);

  const onValidationError = () => {
    // Called when RHF validation fails; no-op — errors shown per-field
  };

  return { errorMessage, onValidationError };
}
