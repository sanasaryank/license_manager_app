import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { CustomerLicense } from '../../types/customer';

interface Props {
  open: boolean;
  onClose: () => void;
  licenses: CustomerLicense[];
  /** Called with the hwid of the selected license. */
  onSelect: (hwid: string) => void;
  /** IDs currently downloading — used to show loading state per row. */
  loadingHwids?: Set<string>;
}

export function LicenseSelectModal({ open, onClose, licenses, onSelect, loadingHwids }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('customers.downloadLicenseSelectTitle')}
      size="sm"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
      }
    >
      <p className="mb-4 text-sm text-gray-500">
        {t('customers.downloadLicenseSelectPrompt')}
      </p>
      <ul className="flex flex-col gap-2">
        {licenses.map((lic) => {
          const isLoading = loadingHwids?.has(lic.hwid) ?? false;
          return (
            <li key={lic.hwid}>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => onSelect(lic.hwid)}
                disabled={isLoading}
                loading={isLoading}
              >
                {lic.OrgName || lic.hwid}
              </Button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
