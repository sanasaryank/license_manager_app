// Multilingual name/string object — keys match ARM / ENG / RUS
export interface Translation {
  ARM: string;
  ENG: string;
  RUS: string;
}

// Safe JSON value type (used in history diff values)
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

// Language codes
export type LangCode = 'ARM' | 'ENG' | 'RUS';

// Pagination state
export interface PaginationState {
  page: number;
  pageSize: number;
}

// Sort state
export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

// Normalized app error
export interface AppError {
  status?: number;
  title: string;
  message: string;
  details?: string;
}
