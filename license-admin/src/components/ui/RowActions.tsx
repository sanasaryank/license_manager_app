import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { IconEdit, IconLock, IconUnlock, IconHistory, IconView } from './Icons';

interface RowAction {
  type: 'edit' | 'block' | 'unblock' | 'history' | 'view' | 'custom';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

interface RowActionsProps {
  actions: RowAction[];
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  edit: <IconEdit />,
  block: <IconLock />,
  unblock: <IconUnlock />,
  history: <IconHistory />,
  view: <IconView />,
};

export function RowActions({ actions, className }: RowActionsProps) {
  const { t } = useTranslation();

  const defaultLabel: Record<string, string> = {
    edit: t('common.edit'),
    block: t('common.block'),
    unblock: t('common.unblock'),
    history: t('common.history'),
    view: t('common.showDetails'),
  };

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {actions.map((action, i) => (
        <Button
          key={i}
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.label ?? defaultLabel[action.type]}
          aria-label={action.label ?? defaultLabel[action.type]}
        >
          {action.icon ?? iconMap[action.type]}
        </Button>
      ))}
    </div>
  );
}
