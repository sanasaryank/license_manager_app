import type { Translation } from './common';

export type EmployeeRole = 'admin' | 'superadmin';

export interface EmployeeListItem {
  id: string;
  username: string;
  name: Translation;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

export interface Employee extends EmployeeListItem {
  hash: string;
}

export interface EmployeeCreatePayload {
  username: string;
  password: string;
  name: Translation;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

export interface EmployeeUpdatePayload {
  id: string;
  hash?: string;
  username?: string;
  password?: string;
  name?: Translation;
  role?: EmployeeRole;
  isBlocked?: boolean;
  description?: string;
}
