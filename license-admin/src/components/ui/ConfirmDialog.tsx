import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  loading?: boolean;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  loading,
  confirmVariant = 'danger',
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {t('common.yes')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}
