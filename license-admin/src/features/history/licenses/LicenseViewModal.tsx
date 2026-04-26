import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../../queryKeys';
import { getLicenseRequest, getLicenseGranted } from '../../../api/licenseHistory';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';

interface Props {
  open: boolean;
  id: number;
  mode: 'request' | 'granted';
  onClose: () => void;
}

export function LicenseViewModal({ open, id, mode, onClose }: Props) {
  const { t } = useTranslation();
  const idStr = String(id);

  const { data, isLoading, error } = useQuery({
    queryKey:
      mode === 'request'
        ? queryKeys.licenseHistory.request(idStr)
        : queryKeys.licenseHistory.granted(idStr),
    queryFn:
      mode === 'request'
        ? () => getLicenseRequest(idStr)
        : () => getLicenseGranted(idStr),
    enabled: open && id != null,
  });

  const title =
    mode === 'request'
      ? t('licenseHistory.requestTitle')
      : t('licenseHistory.grantedTitle');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <p className="py-4 text-center text-sm text-red-500">{String(error)}</p>
      );
    }

    if (data == null) {
      return (
        <p className="py-4 text-center text-sm text-gray-500">{t('common.noData')}</p>
      );
    }

    // Response is plain JSON — pretty print directly
    return (
      <pre className="whitespace-pre-wrap break-all rounded bg-gray-50 p-4 text-xs font-mono text-gray-800">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {renderContent()}
    </Modal>
  );
}
