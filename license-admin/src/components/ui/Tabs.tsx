import React, { useState } from 'react';
import clsx from 'clsx';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
  defaultTab?: string;
}

export function Tabs({ tabs, children, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? '');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors focus:outline-none',
              active === tab.key
                ? 'border-b-2 border-primary-600 text-primary-700'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
