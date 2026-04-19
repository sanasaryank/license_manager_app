import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getHistoryItem } from '../../api/history';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { DiffNodeRenderer } from '../../utils/historyDiff';

interface Props {
  open: boolean;
  id: number;
  onClose: () => void;
}

export function HistoryDetailModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.history.item(id),
    queryFn: () => getHistoryItem(id),
    enabled: open,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('history.details')}
      size="xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : data && Object.keys(data).length > 0 ? (
        <div className="flex flex-col gap-3">
          {Object.entries(data).map(([key, node]) => (
            <DiffNodeRenderer key={key} label={key} node={node} t={t} />
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-500">{t('history.noChanges')}</p>
      )}
    </Modal>
  );
}
