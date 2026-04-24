import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FilterPanel } from './FilterPanel';
import { FilterProvider } from '../../providers/FilterProvider';
import { FILTER_CONFIGS } from '../../constants/filterConfigs';

export function AppShell() {
  const { pathname } = useLocation();
  const hasFilters = !!FILTER_CONFIGS[pathname]?.length;
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <FilterProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            showFilterToggle={hasFilters}
            filterOpen={filterOpen}
            onFilterToggle={() => setFilterOpen((v) => !v)}
          />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
            {hasFilters && filterOpen && <FilterPanel />}
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
