import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';

// Filter option (for select-type filters)
export interface FilterOption {
  value: string;
  label: string;
}

// Per-route filter state
type RouteFilterState = Record<string, string>;

interface FilterContextValue {
  filterValues: RouteFilterState;
  setFilterValue: (key: string, value: string) => void;
  resetFilters: () => void;
  filterOptions: Record<string, FilterOption[]>;
  registerFilterOptions: (key: string, options: FilterOption[]) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilterValues(): RouteFilterState {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterValues must be used within FilterProvider');
  return ctx.filterValues;
}

export function useSetFilterValue(): (key: string, value: string) => void {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useSetFilterValue must be used within FilterProvider');
  return ctx.setFilterValue;
}

export function useResetFilters(): () => void {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useResetFilters must be used within FilterProvider');
  return ctx.resetFilters;
}

export function useFilterOptions(): Record<string, FilterOption[]> {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterOptions must be used within FilterProvider');
  return ctx.filterOptions;
}

export function useRegisterFilterOptions(): (key: string, options: FilterOption[]) => void {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useRegisterFilterOptions must be used within FilterProvider');
  return ctx.registerFilterOptions;
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // Separate state per route
  const [allFilters, setAllFilters] = useState<Record<string, RouteFilterState>>({});
  const [allOptions, setAllOptions] = useState<Record<string, Record<string, FilterOption[]>>>({});
  const prevPath = useRef(pathname);

  // Reset options when route changes
  React.useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
    }
  }, [pathname]);

  const filterValues: RouteFilterState = allFilters[pathname] ?? {};
  const filterOptions: Record<string, FilterOption[]> = allOptions[pathname] ?? {};

  const setFilterValue = useCallback(
    (key: string, value: string) => {
      setAllFilters((prev) => ({
        ...prev,
        [pathname]: { ...(prev[pathname] ?? {}), [key]: value },
      }));
    },
    [pathname],
  );

  const resetFilters = useCallback(() => {
    setAllFilters((prev) => ({ ...prev, [pathname]: {} }));
  }, [pathname]);

  const registerFilterOptions = useCallback(
    (key: string, options: FilterOption[]) => {
      setAllOptions((prev) => {
        const existing = prev[pathname]?.[key];
        // Avoid unnecessary re-renders
        if (existing && JSON.stringify(existing) === JSON.stringify(options)) return prev;
        return {
          ...prev,
          [pathname]: { ...(prev[pathname] ?? {}), [key]: options },
        };
      });
    },
    [pathname],
  );

  const value = useMemo(
    () => ({ filterValues, setFilterValue, resetFilters, filterOptions, registerFilterOptions }),
    [filterValues, setFilterValue, resetFilters, filterOptions, registerFilterOptions],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
