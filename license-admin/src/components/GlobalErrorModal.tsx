import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useErrorModal } from '../providers/ErrorModalProvider';

export function GlobalErrorModal() {
  const { errors, dismissCurrent } = useErrorModal();
  const { t } = useTranslation();

  const current = errors[0];

  const title = current
    ? t(`errors.${current.title}`, { defaultValue: current.title })
    : '';
  const message = current
    ? t(`errors.${current.message}`, { defaultValue: current.message })
    : '';

  return (
    <Modal
      open={!!current}
      onClose={dismissCurrent}
      title={title}
      size="sm"
      footer={
        <Button onClick={dismissCurrent}>{t('common.close')}</Button>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
      {current?.details && (
        <pre className="mt-3 rounded bg-gray-50 p-3 text-xs text-gray-500 overflow-auto max-h-40">
          {JSON.stringify(current.details, null, 2)}
        </pre>
      )}
    </Modal>
  );
}
