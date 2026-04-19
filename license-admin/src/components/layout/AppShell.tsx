import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FilterPanel } from './FilterPanel';
import { FilterProvider } from '../../providers/FilterProvider';

export function AppShell() {
  return (
    <FilterProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
            <FilterPanel />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
