# Frontend Spec License Admin

## Frontend specification — License Admin

This document describes the implemented React frontend application for administering employees, customers, license types, customer tags, validators, and change history.

There is also a **reference-project** in repository https://github.com/sanasaryank/Customer-configuration-portal.git, which was used as a base. The following parts were copied and adapted from `reference-project`:

- `Login`
- `CustomerTags`
- `History`

---

## 1. Application purpose

The application is intended for an internal administrative panel.

Main functions:

- employee authentication;
- viewing and editing dictionaries (employees, customer tags, license types, validators);
- viewing and editing customers and their licenses;
- viewing change history;
- role-based access control.

---

## 2. Stack and general implementation

Implemented stack:

- React 18
- TypeScript
- React Router 6 (`react-router-dom`)
- TanStack Query (`@tanstack/react-query`) for server state
- React Hook Form (`react-hook-form`) for forms
- Zod (`zod`) for validation via `@hookform/resolvers`
- Tailwind CSS for styling
- i18next / react-i18next for localization
- clsx for conditional class names
- Vite as the build tool

Implementation details:

- SPA application;
- cookie-based session after login;
- a single API client (`src/api/client.ts`);
- full DTO typing (`src/types/`);
- reusable tables, forms, modals, and filters;
- a single global error modal with a message queue;
- optimistic locking handling via `hash`;
- diff-based update: when editing, only changed fields are sent to the backend via `buildDiffPayload`;
- block/unblock sends only `{ id, isBlocked }` directly without fetching the latest hash.

---

## 3. Localization and multilingual support

The project supports **3 languages**:

- English (ENG);
- Armenian (ARM);
- Russian (RUS).

### Language codes

The application uses `LangCode = 'ARM' | 'ENG' | 'RUS'` internally.

These map to i18next language keys: `arm`, `eng`, `rus`.

### General i18n rules

- the entire application is fully localizable;
- all UI text elements come from localization files;
- all labels for enum values come from localization files;
- UI strings are not hardcoded inside components;
- language switching is handled through i18next and the `AuthProvider` context;
- the selected language is persisted in `localStorage` (key: `license_admin_lang`) and restored on the next app launch;
- the default application language is `ENG`.

### What is localized

- menu item titles;
- page titles;
- button labels;
- table headers and column names;
- placeholders;
- error texts;
- modal messages;
- action labels;
- filter labels;
- status labels;
- labels for enum values.

### Localization of enum values

All enum values displayed in the UI are shown through localization dictionaries.

Keys used:

- `Employees.role.admin`
- `Employees.role.superadmin`
- `LicenseTypes.fields.kind.string`
- `LicenseTypes.fields.kind.int`
- `LicenseTypes.fields.kind.float`
- `LicenseTypes.fields.kind.date`
- `LicenseTypes.fields.kind.datetime`
- `LicenseTypes.fields.kind.time`
- `LicenseTypes.fields.kind.boolean`
- `History.actionType.create`
- `History.actionType.edit`
- `History.actionType.delete`

### Translation source

All translations are stored in:

```txt
src/i18n/locales/eng.ts
src/i18n/locales/arm.ts
src/i18n/locales/rus.ts
```

### Multilingual entity names (`Translation` type)

Several entities (Employee, CustomerTag, LicenseType) use a multilingual `Translation` object for their `name` field:

```ts
interface Translation {
  ARM: string;
  ENG: string;
  RUS: string;
}
```

The frontend resolves the display name using the current language with fallback order: selected → ENG → ARM → RUS → empty string.

A reusable `TranslationEditor` component is used in forms to edit all three language values.

---

## 4. Roles and access rights

### Enums

#### `Employees.role`

- `admin`
- `superadmin`

#### `LicenseTypes.fields.kind`

- `string`
- `int`
- `float`
- `date`
- `datetime`
- `time`
- `boolean`

#### `History.actionType`

- `create`
- `edit`
- `delete`

### Access rights

- `superadmin`:
  - access to all pages;
- `admin`:
  - access only to the `Customers` page.

### Frontend access rules

- the frontend hides inaccessible menu items based on user role;
- the user does not see links to pages they do not have access to;
- protected routes check the role and redirect to `/customers` if the user directly opens an inaccessible route;
- for `admin`, the first and only available page is `/customers`;
- for `superadmin`, the first page after login and also the fallback page for nonexistent or forbidden routes is `/customers`.

---

## 5. Application pages

The application has **7 pages**:

1. `Login`
2. `Customers`
3. `Dictionaries / Employees`
4. `Dictionaries / CustomerTags`
5. `Dictionaries / LicenseTypes`
6. `Dictionaries / Validators`
7. `History`

### Routing

- `/login`
- `/customers`
- `/dictionaries/employees`
- `/dictionaries/customertags`
- `/dictionaries/licensetypes`
- `/dictionaries/validators`
- `/history`

### Routing rules

- if the user is not authenticated, redirect to `/login`;
- if the user is authenticated and opens `/login`, redirect to `/customers`;
- the menu is rendered based on the role;
- `admin` can not see or open `Employees`, `CustomerTags`, `LicenseTypes`, `Validators`, or `History`;
- all pages are lazy-loaded using `React.lazy` and wrapped in a `Suspense` boundary.

---

## 6. Layout

### General structure

- left side: sidebar menu (fixed width 224px);
- right side: main content area;
- top: top bar with language selector and user name;
- inside the main content:
  - page toolbar;
  - table;
  - create / edit modals;
- filter panel displayed as a right sidebar (only on pages with filters).

### Side menu

#### For `superadmin`

- Customers
- Dictionaries (collapsible group)
  - Employees
  - CustomerTags
  - LicenseTypes
  - Validators
- History
- Logout

#### For `admin`

- Customers
- Logout

### Filter panel

The filter panel exists on these pages:

- `Customers`
- `History`

Implementation:

- the filter panel is rendered as a fixed right sidebar (`FilterPanel` component);
- it automatically appears based on the current route's filter configuration;
- filter state is stored per-route in `FilterProvider` context;
- there is a `Reset filters` button;
- filter configuration is defined in `src/constants/filterConfigs.ts`.

---

## Base URL

The base URL is configured via the `VITE_API_BASE_URL` environment variable.

Default production base URL: `https://license.trio.am`

---

## 7. Auth flow

### 7.1 Login

**Endpoint:** `POST {base_url}/login`

#### Request

Header:

```txt
Authorization: Basic base64(login:pass)
```

#### Cookie

The backend sets a server-side cookie:

```txt
license.trio.am_token
```

The frontend sends the cookie with all subsequent requests via `credentials: 'include'`.

#### Response

- `200` — successful login;
- `401` — authorization error.

#### Frontend behavior

- form fields: `username`, `password`;
- show/hide password toggle;
- language selector on the login page;
- after successful login, the backend sets the cookie;
- after successful login, the frontend calls `/me` and gets the current user;
- then redirects to `/customers`.

#### Errors

- `401`: show the message from `auth.loginError` translation key;
- all other errors: show through the shared global error mechanism.

### 7.2 Current user

**Endpoint:** `GET {base_url}/me`

#### Response

```json
{
  "id": "string",
  "username": "string",
  "name": "string",
  "role": "string"
}
```

If the cookie is missing or invalid, the endpoint returns `401`.

#### Special rule for bootstrap `/me`

During the initial session check, if `/me` returns `401`, the frontend **does not** show an "expired session" modal. The frontend silently sets user to `null` and routing redirects to `/login`.

The frontend uses `/me` for:

- restoring the session after reload (via React Query with `staleTime: Infinity`);
- determining the role;
- showing the user's name;
- controlling route and menu access.

### 7.3 Logout

**Endpoint:** `POST {base_url}/logout`

#### Response

- `204`

#### Frontend behavior

- call logout;
- set user state to `null`;
- fully clear the React Query cache (`queryClient.clear()`);
- redirect to `/login`.

---

## 8. General rules for lists and entities

For all entities that have `GET list`, `GET by id`, `POST`, and `PUT`, the same UX is used:

- a table with the list;
- a `Create` button;
- `Edit` opens the edit form in a modal;
- `Block/Unblock` changes `isBlocked` through a direct `PUT` with `{ id, isBlocked }`;
- `History` navigates to `/history?objectId={id}`;
- before editing, `GET /{entity}/{id}` is called to get the latest `hash` and the source object.

### Optimistic locking

If the detail endpoint returns `hash`, then:

- detail is loaded before editing;
- `hash` is sent in `PUT`;
- after successful save, list and detail queries are invalidated.

### Block action

Blocking and unblocking are done through `PUT` by changing `isBlocked`. The block toggle sends only `{ id, isBlocked }` without fetching the detail hash first.

### Partial update contract for PUT

In all `PUT` requests (except block toggle), the frontend sends only the changed fields.

Implementation via `buildDiffPayload` helper:

- `id` is always included in every `PUT` payload;
- `hash` is included when available;
- all other fields are sent only if they differ from the original;
- if the user opens the form and saves without changes, no request is sent;
- comparison is done against the detail object loaded before editing;
- nested structures (`items`, `fields`, `licenses`, `values`) are compared by JSON serialization (order matters) and sent as whole structures;
- `buildDiffPayload` returns `null` when nothing changed.

### Unified error handling

A shared handler for all errors and a single global error modal.

Implementation:

- `errorNormalizer.ts` converts any error into a common `AppError` shape;
- `errorHandler.ts` provides module-level callbacks for pushing errors and clearing sessions;
- `ErrorModalProvider` maintains a queue of errors;
- `GlobalErrorModal` displays errors one by one from the queue;
- React Query's `QueryCache.onError` and `MutationCache.onError` automatically push errors to the global modal (except `SessionExpiredError`).

### Behavior for 401

If any protected request other than the initial `/me` returns `401`:

- the `handleSessionExpired` function is called;
- an "expired session" error is pushed to the global error modal;
- user state is cleared via the registered callback;
- redirect to `/login` after 150ms delay.

### Behavior for other errors

- `400 / 422`: show the backend error text or fallback "Validation error";
- `403`: show "Insufficient permissions";
- `404`: show "Object not found";
- `409`: show a conflict message. The edit form remains open;
- `5xx`: show "Internal server error";
- network error (fetch TypeError): show "Failed to connect to the server".

In all cases except logout and silent bootstrap `/me`, the edit form does not close automatically on error.

### Table states

Each table supports the standard states via the `Table` component:

- `loading` — spinner;
- `empty` — configurable empty text;
- `error` — error text display;
- `data` — rows.

### Client-side data processing

All operations are performed on the client via the `useListOperations` hook:

- client-side filtering (text search + external filters);
- client-side sorting;
- client-side paging.

### Client-side paging

All tables use client-side pagination via the `Pagination` component.

Settings:

- page size selector: `10 / 20 / 50 / 100`;
- default page size: `20`.

If the user changes filtering or sorting:

- the current page resets to the first one.

If the total number of records is smaller than the smallest page size option (10) and there is only one page, the paginator is hidden.

---

## 9. Employees

This section is available only to `superadmin`.

### 9.1 API

#### GET list

**Endpoint:** `GET {base_url}/employees`

**Response**

```json
[
  {
    "id": "string",
    "username": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "role": "string",
    "isBlocked": true,
    "description": "string"
  }
]
```

#### GET by id

**Endpoint:** `GET {base_url}/employees/{id}`

**Response**

```json
{
  "id": "string",
  "username": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "string",
  "isBlocked": true,
  "description": "string",
  "hash": "string"
}
```

#### POST

**Endpoint:** `POST {base_url}/employees`

**Request**

```json
{
  "username": "string",
  "password": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "string",
  "isBlocked": true,
  "description": "string"
}
```

#### PUT

**Endpoint:** `PUT {base_url}/employees/{id}`

`PUT` sends only changed fields plus mandatory technical fields.

**Request**

```json
{
  "id": "string",
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "string",
  "isBlocked": true
}
```

If the password was not changed, `password` is not sent. If the password was changed, `password` is included in the payload.

### 9.2 DTO

```ts
import type { Translation } from './common';

type EmployeeRole = 'admin' | 'superadmin';

interface EmployeeListItem {
  id: string;
  username: string;
  name: Translation;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

interface Employee extends EmployeeListItem {
  hash: string;
}

interface EmployeeCreatePayload {
  username: string;
  password: string;
  name: Translation;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

interface EmployeeUpdatePayload {
  id: string;
  hash?: string;
  username?: string;
  password?: string;
  name?: Translation;
  role?: EmployeeRole;
  isBlocked?: boolean;
  description?: string;
}
```

### 9.3 Table

Columns:

- `Name` — sortable (resolved from `Translation` by current language)
- `Username` — sortable
- `Role` — displayed via i18n enum label
- `Status` — blocked/active badge
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block / Unblock`
- `History`

### 9.4 Create / edit form

Fields:

- `username` — required;
- `password` — required on create, optional on edit (hint: "Leave empty to keep existing password");
- `name` — `TranslationEditor` (ARM / ENG / RUS fields);
- `role` — select: `admin`, `superadmin`;
- `isBlocked` — checkbox;
- `description` — textarea.

UX:

- load detail by `id` before editing;
- keep the original object and `hash`;
- build a diff payload on save;
- if the user did not change the password, do not send `password`;
- if the user changed nothing and password is empty, do not send `PUT`.

---

## 10. LicenseTypes

This section is available only to `superadmin`.

### 10.1 API

#### GET list

**Endpoint:** `GET {base_url}/licenseTypes`

**Response**

```json
[
  {
    "id": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "fields": [
      {
        "name": "string",
        "kind": "string",
        "required": true,
        "enum": []
      }
    ],
    "isBlocked": true,
    "description": "string"
  }
]
```

#### GET by id

**Endpoint:** `GET {base_url}/licenseTypes/{id}`

**Response**

```json
{
  "id": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string",
      "required": true,
      "enum": []
    }
  ],
  "isBlocked": true,
  "description": "string",
  "hash": "string"
}
```

#### POST

**Endpoint:** `POST {base_url}/licenseTypes`

**Request**

```json
{
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string",
      "required": true,
      "enum": []
    }
  ],
  "isBlocked": true,
  "description": "string"
}
```

#### PUT

**Endpoint:** `PUT {base_url}/licenseTypes/{id}`

`PUT` sends only changed fields plus mandatory technical fields.

**Request**

```json
{
  "id": "string",
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string",
      "required": true,
      "enum": []
    }
  ]
}
```

### 10.2 DTO

```ts
import type { Translation } from './common';

type LicenseFieldKind = 'string' | 'int' | 'float' | 'date' | 'datetime' | 'time' | 'boolean';

interface LicenseTypeField {
  name: string;
  kind: LicenseFieldKind;
  required: boolean;
  enum: string[];
}

interface LicenseTypeListItem {
  id: string;
  name: Translation;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

interface LicenseTypeDetail extends LicenseTypeListItem {
  hash: string;
}

interface LicenseTypeCreatePayload {
  name: Translation;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

interface LicenseTypeUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  fields?: LicenseTypeField[];
  isBlocked?: boolean;
  description?: string;
}
```

### 10.3 Rule for `enum`

The backend guarantees that the `enum` field is used only for `kind === 'string'`. The frontend only renders the enum editor when `kind === 'string'`.

### 10.4 Table

Columns:

- `Name` — sortable (resolved from `Translation`)
- `Fields count`
- `Status` — blocked/active badge
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block / Unblock`
- `History`

### 10.5 Create / edit form

Fields:

- `name` — `TranslationEditor` (ARM / ENG / RUS)
- `fields` — dynamic list with add/remove
- `isBlocked` — checkbox
- `description` — textarea

Each field item:

- `name` — text input, required
- `kind` — select from `LicenseFieldKind`, labeled via i18n
- `required` — checkbox
- `enum` — dynamic string list, visible only when `kind === 'string'`

---

## 11. CustomerTags

This section is available only to `superadmin`.

### 11.1 API

#### GET list

**Endpoint:** `GET {base_url}/customerTags`

**Response**

```json
[
  {
    "id": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "description": "string",
    "isBlocked": false,
    "items": [
      {
        "id": "string",
        "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
        "description": "string",
        "isBlocked": false
      }
    ],
    "itemsCount": 1
  }
]
```

#### GET by id

**Endpoint:** `GET {base_url}/customerTags/{id}`

**Response**

```json
{
  "id": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
      "description": "string",
      "isBlocked": false
    }
  ],
  "itemsCount": 1,
  "hash": "string"
}
```

#### POST

**Endpoint:** `POST {base_url}/customerTags`

**Request**

```json
{
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
      "description": "string",
      "isBlocked": false
    }
  ]
}
```

#### PUT

**Endpoint:** `PUT {base_url}/customerTags/{id}`

`PUT` sends only changed fields plus mandatory technical fields. If the `items` array changed, it is sent as a whole.

**Request**

```json
{
  "id": "string",
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
      "description": "string",
      "isBlocked": false
    }
  ]
}
```

### 11.2 DTO

```ts
import type { Translation } from './common';

interface CustomerTagItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

interface CustomerTagListItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
  itemsCount: number;
}

interface CustomerTagDetail extends CustomerTagListItem {
  hash: string;
}

interface CustomerTagCreatePayload {
  name: Translation;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
}

interface CustomerTagUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  description?: string;
  isBlocked?: boolean;
  items?: CustomerTagItem[];
}
```

### 11.3 Table

Columns:

- `Name` — sortable (resolved from `Translation`)
- `ItemsCount`
- `Status` — blocked/active badge
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block / Unblock`
- `History`

### 11.4 Create / edit form

Fields:

- `name` — `TranslationEditor` (ARM / ENG / RUS)
- `description` — textarea
- `isBlocked` — checkbox
- `items` — dynamic list via `TagItemsEditor` component

Each `item`:

- `id` — text input, required
- `name` — `TranslationEditor` (ARM / ENG / RUS)
- `description` — text input
- `isBlocked` — checkbox

---

## 12. Customers

This is the main and most complex page. Available to both `admin` and `superadmin`.

### 12.1 API

#### GET list

**Endpoint:** `GET {base_url}/customers`

**Response**

```json
[
  {
    "id": "string",
    "name": "string",
    "legalName": "string",
    "TIN": "string",
    "responsibleId": "string",
    "responsibleName": "string",
    "tags": ["string"],
    "licenses": [
      {
        "OrgName": "string",
        "MaxConnCount": 1,
        "hwid": "string",
        "licenseTypeId": "string",
        "track": true,
        "values": {
          "key": "value"
        },
        "isBlocked": true,
        "description": "string"
      }
    ],
    "isBlocked": true,
    "description": "string"
  }
]
```

#### GET by id

**Endpoint:** `GET {base_url}/customers/{id}`

**Response**

```json
{
  "id": "string",
  "name": "string",
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "responsibleName": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 1,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": true,
      "values": {
        "key": "value"
      },
      "isBlocked": true,
      "description": "string"
    }
  ],
  "isBlocked": true,
  "description": "string",
  "hash": "string"
}
```

#### POST

**Endpoint:** `POST {base_url}/customers`

**Request**

```json
{
  "id": "string",
  "name": "string",
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 1,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": true,
      "values": {
        "key": "value"
      },
      "isBlocked": true,
      "description": "string"
    }
  ],
  "isBlocked": true,
  "description": "string"
}
```

#### PUT

**Endpoint:** `PUT {base_url}/customers/{id}`

`PUT` sends only changed fields plus mandatory technical fields.

**Request**

```json
{
  "id": "string",
  "hash": "string",
  "name": "string",
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 1,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": true,
      "values": {
        "key": "value"
      },
      "isBlocked": true,
      "description": "string"
    }
  ],
  "isBlocked": true,
  "description": "string"
}
```

### 12.2 DTO

```ts
interface CustomerLicense {
  OrgName: string;
  MaxConnCount: number;
  hwid: string;
  licenseTypeId: string;
  track: boolean;
  values: Record<string, unknown>;
  isBlocked: boolean;
  description: string;
}

interface CustomerListItem {
  id: string;
  name: string;
  legalName: string;
  TIN: string;
  responsibleId: string;
  responsibleName: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
}

interface CustomerDetail extends CustomerListItem {
  hash: string;
}

interface CustomerCreatePayload {
  id: string;
  name: string;
  legalName: string;
  TIN: string;
  responsibleId: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
}

interface CustomerUpdatePayload {
  id: string;
  hash?: string;
  name?: string;
  legalName?: string;
  TIN?: string;
  responsibleId?: string;
  tags?: string[];
  licenses?: CustomerLicense[];
  isBlocked?: boolean;
  description?: string;
}
```

### 12.3 Table

Columns:

- `Name` — sortable
- `Responsible` — sortable by `responsibleName`
- `Licenses` — colored abbreviation badges
- `Tags` — compact chips
- `Status` — blocked/active badge
- `Actions`

Actions:

- `Edit`
- `Block / Unblock`
- `History`

### 12.4 Display of LicenseTypes

Implementation via `getLicenseTypeBadge` utility:

- abbreviation is built from `LicenseType.name` (first letters of words, or first 2–3 characters);
- color is assigned deterministically from a 15-color palette using a hash of `licenseTypeId`;
- results are cached in a module-level `Map`;
- displayed as `LicenseBadge` components with colored background and white text.

### 12.5 Display of Tags

Implementation via `TagChip` component:

- format: `tagname: tagitemname` (resolved from `Translation` by current language);
- displayed as compact chips with primary color theme;
- shows first 3 chips;
- remaining are shown as `+N` text.

### 12.6 Filters on the Customers page

The `Customers` page has a separate filter panel with:

- `name` — text search
- `responsibleName` — text search
- `licenseTypeId` — select (options populated from license types)
- `tag` — select (options populated from tag items as `tagId:tagItemId`)
- `TIN` — text search
- `isBlocked` — switch/checkbox

All filtering is client-side on top of the loaded list.

### 12.7 Customer create / edit form

The form uses a tabbed layout (`Tabs` component) with 3 tabs:

**General tab:**

- `id` — required, editable on create, disabled on edit
- `name` — required
- `legalName`
- `TIN`
- `responsibleId` — select populated from employees list
- `isBlocked` — checkbox
- `description` — textarea

**Tags tab:**

- `tags` — multi-select checkboxes populated from customer tags

**Licenses tab:**

- `licenses` — dynamic array of `LicenseCard` components

Each license is displayed as a collapsible card with:

- header: license type name + `OrgName` + blocked badge
- body fields:
  - `licenseTypeId` — select
  - `OrgName` — text input
  - `MaxConnCount` — number input
  - `hwid` — text input
  - `track` — checkbox
  - `isBlocked` — checkbox
  - `description` — textarea
  - dynamic `values` fields based on selected license type

### Dynamic construction of `values`

When a `licenseTypeId` is selected, the `DynamicValuesEditor` component:

1. finds the license type from the preloaded `licenseTypes` list;
2. renders input fields for each `field` in `licenseType.fields`;
3. uses the appropriate input type based on `field.kind`;
4. if the field has a non-empty `enum`, renders a `Select` instead.

### Rendering inputs by kind

- `string` → text input
- `int` → number input
- `float` → number input
- `date` → date input
- `datetime` → datetime-local input
- `time` → time input
- `boolean` → checkbox

---

## 13. Validators

This section is available only to `superadmin`. Validators allow defining JSON schema-based validation rules for API endpoints.

### 13.1 API

#### GET list

**Endpoint:** `GET {base_url}/validators`

**Response**

```json
[
  {
    "id": "string",
    "version": "string",
    "endpoint": "string",
    "schema": { "kind": "object", "fields": {} },
    "method_rules": {}
  }
]
```

#### GET by id

**Endpoint:** `GET {base_url}/validators/{id}`

**Response**

```json
{
  "id": "string",
  "version": "string",
  "endpoint": "string",
  "schema": { "kind": "object", "fields": {} },
  "method_rules": {},
  "hash": "string"
}
```

#### POST

**Endpoint:** `POST {base_url}/validators`

**Request**

```json
{
  "id": "string (optional)",
  "version": "string",
  "endpoint": "string",
  "schema": {},
  "method_rules": {}
}
```

#### PUT

**Endpoint:** `PUT {base_url}/validators/{id}`

`PUT` sends the full object (not a diff) plus `hash`.

**Request**

```json
{
  "version": "string",
  "endpoint": "string",
  "schema": {},
  "method_rules": {},
  "hash": "string"
}
```

#### DELETE

**Endpoint:** `DELETE {base_url}/validators/{id}`

**Response:** `204`

### 13.2 DTO

```ts
type SchemaKind =
  | 'string' | 'integer' | 'number' | 'boolean' | 'null'
  | 'object' | 'array' | 'map'
  | 'date' | 'time' | 'datetime' | 'date-time';

interface SchemaNode {
  kind: SchemaKind;
  nullable?: boolean;
  enum?: unknown[];
  // string
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  // integer / number
  min?: number;
  max?: number;
  // array
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
  // object
  fields?: Record<string, SchemaNode>;
  required?: string[];
  allowExtra?: boolean;
  // map
  values?: SchemaNode;
  keyPattern?: string;
  keyEnum?: string[];
}

type HttpMethod = 'POST' | 'PUT' | 'PATCH';

interface MethodRuleSet {
  forbid_fields: string[];
  add_required: string[];
  remove_required: string[];
}

type MethodRules = Partial<Record<HttpMethod, MethodRuleSet>>;

interface ValidatorListItem {
  id: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
  method_rules?: MethodRules;
}

interface ValidatorItem extends ValidatorListItem {
  hash: string;
}

interface ValidatorCreatePayload {
  id?: string;
  version: string;
  endpoint: string;
  schema: SchemaNode;
  method_rules?: MethodRules;
}

interface ValidatorUpdatePayload extends ValidatorCreatePayload {
  hash: string;
}
```

### 13.3 Table

Columns:

- `Version` — sortable
- `Endpoint` — sortable, displayed in monospace
- `Actions`

Actions:

- `Edit`
- `Copy` (creates new validator pre-filled from existing)
- `Delete` (with confirmation dialog)
- `History`

### 13.4 Create / edit form

The form uses a tabbed layout with 3 tabs:

**Builder tab:**

- `version` — required text input
- `endpoint` — required text input
- `schema` — interactive `SchemaBuilder` component for visually constructing the JSON schema tree

**JSON Preview tab:**

- read-only JSON viewer of the schema
- preview mode selector: Base / POST / PUT / PATCH (applies method rules to show the effective schema)

**Method Rules tab:**

- `MethodRulesEditor` component
- configure per-HTTP-method rules: forbidden fields, additional required fields, fields to remove from required

---

## 14. History

### 14.1 API

#### GET list

**Endpoint:** `GET {base_url}/history`

**Response**

```json
[
  {
    "id": 159,
    "date": "2026-04-29",
    "userId": "b9bb70b410fc6989e74ec3521f18173f",
    "userName": "string",
    "actionType": "edit",
    "objectType": "products",
    "objectId": "d5d7a9d37ca0a5d2fb6925c6abec6fd8"
  }
]
```

#### GET filtered by objectId

**Endpoint:** `GET {base_url}/history?objectId={oid}`

**Response**

The same as `GET /history`.

#### GET details

**Endpoint:** `GET {base_url}/historyItem/{id}`

**Response**

The response is a nested object diff. Each changed field is represented by an object of the form:

```json
{
  "old": "any",
  "new": "any"
}
```

For nested objects, the structure repeats recursively.

Example:

```json
{
  "validationSchema": {
    "fields": {
      "tags": {
        "items": {
          "kind": {
            "old": "<missing>",
            "new": "string"
          }
        },
        "kind": {
          "old": "<missing>",
          "new": "array"
        },
        "nullable": {
          "old": "<missing>",
          "new": "true"
        }
      }
    }
  }
}
```

### 14.2 DTO

```ts
type HistoryActionType = 'create' | 'edit' | 'delete';

interface HistoryListItem {
  id: number;
  date: string;
  userId: string;
  userName: string;
  actionType: HistoryActionType;
  objectType: string;
  objectId: string;
}

type HistoryDiffLeaf = {
  old: unknown;
  new: unknown;
};

type HistoryDetails = {
  [key: string]: HistoryDiffLeaf | HistoryDetails;
};
```

Type guards are provided: `isLeafDiffNode` and `isNestedDiffNode`.

### 14.3 Table

Columns:

- `Date` — sortable
- `User` — sortable by `userName`
- `ObjectType` — sortable
- `ObjectId`
- `Action` — sortable (displayed as colored badge: create=success, edit=info, delete=danger)
- `Actions`

Action:

- `Show details`

### 14.4 History filters

Filter fields (defined in `filterConfigs.ts`):

- `dateFrom` / `dateTo` — date inputs (date range filtering applied before other filters)
- `userName` — select (options populated from loaded data)
- `objectType` — text search
- `objectId` — text search
- `actionType` — select with static options (create, edit, delete)

All filters are client-side on top of the loaded list.

### 14.5 History details

Displayed in a modal (`HistoryDetailModal`).

Implementation via `DiffNodeRenderer` component:

- recursively traverses the nested diff structure;
- leaf nodes display side-by-side old/new values;
- nested nodes are rendered as collapsible sections with labels;
- `<missing>` sentinel values are displayed with special styling;
- JSON values are rendered in a `<pre>` block.

### 14.6 History action from other entities

The `History` button in rows of `Employees`, `CustomerTags`, `LicenseTypes`, `Validators`, and `Customers` navigates to:

- `/history?objectId={id}`

The History page reads the `objectId` search parameter and fetches filtered history via `GET /history?objectId={oid}`. A "Show all history" button is shown to clear the filter.

---

## 15. API layer

A single API client (`src/api/client.ts`) with:

- `credentials: 'include'` for sending cookies;
- shared `handleResponse` for all HTTP methods;
- error normalization via `HttpError` and `SessionExpiredError` classes;
- `buildDiffPayload` helper for partial `PUT` payloads;
- JSON parsing if the response contains a body (handles empty `204` responses).

API modules:

- `auth.ts` — `login`, `logout`, `getMe`
- `employees.ts` — `getEmployees`, `getEmployee`, `createEmployee`, `updateEmployee`
- `customerTags.ts` — `getCustomerTags`, `getCustomerTag`, `createCustomerTag`, `updateCustomerTag`
- `licenseTypes.ts` — `getLicenseTypes`, `getLicenseType`, `createLicenseType`, `updateLicenseType`
- `customers.ts` — `getCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`
- `history.ts` — `getAllHistory`, `getHistoryByObject`, `getHistoryItem`
- `validators.ts` — `getValidators`, `getValidator`, `createValidator`, `updateValidator`, `deleteValidator`

### Error normalizer

`errorNormalizer.ts` converts any error into:

```ts
interface AppError {
  status?: number;
  title: string;
  message: string;
  details?: string;
}
```

### Diff helper for update requests

`diffPayload.ts` provides `buildDiffPayload`:

- accepts `original`, `current`, and `requiredFields`;
- compares all fields except required ones;
- uses deep equality via JSON serialization;
- returns `null` when nothing changed.

---

## 16. Query keys

Defined in `src/queryKeys.ts`:

```ts
const queryKeys = {
  me: ['me'],
  employees: {
    all: ['employees'],
    byId: (id: string) => ['employee', id],
  },
  customerTags: {
    all: ['customerTags'],
    byId: (id: string) => ['customerTag', id],
  },
  licenseTypes: {
    all: ['licenseTypes'],
    byId: (id: string) => ['licenseType', id],
  },
  customers: {
    all: ['customers'],
    byId: (id: string) => ['customer', id],
  },
  history: {
    all: ['history'],
    byObjectId: (objectId: string) => ['history', objectId],
    item: (id: number) => ['historyItem', id],
  },
  validators: {
    all: ['validators'],
    byId: (id: string) => ['validators', id],
  },
};
```

---

## 17. Sorting, filtering, and paging

Implemented sortable columns:

- Employees: `name` (with Translation resolution), `username`
- CustomerTags: `name` (with Translation resolution)
- LicenseTypes: `name` (with Translation resolution)
- Validators: `version`, `endpoint`
- History: `date`, `userName`, `objectType`, `actionType`
- Customers: `name`, `responsibleName`

### Implementation

All handled by the `useListOperations` hook which maintains:

- `search` — text search term
- `filters` — external filter values from `FilterProvider`
- `sort` — current sort state
- `pagination` — `{ page, pageSize }`

Pipeline:

1. load data via React Query;
2. apply text search across `searchFields`;
3. apply external filters via `filterFields` config;
4. apply sorting via `sortFields` extractors;
5. take a slice by `page / pageSize`.

---

## 18. Forms and validation

### 18.1 General rules

- required fields are visually marked;
- field errors are shown under the field;
- submit button shows loading state while saving;
- after successful save:
  - close the modal;
  - invalidate related queries to refresh the table;
- if any error occurs, the form stays open and the error is shown in an `ErrorBanner` within the form.

### 18.2 Basic validation (via Zod schemas)

#### Employees

- `username` — required (min 1);
- `password` — optional (not validated on edit);
- `name` — Translation object with ARM/ENG/RUS fields;
- `role` — enum: `admin` | `superadmin`.

#### LicenseTypes

- `name` — Translation object;
- `fields[].name` — required (min 1);
- `fields[].kind` — required enum;
- `fields[].required` — boolean;
- `fields[].enum` — string array.

#### CustomerTags

- `name` — Translation object;
- `items[].id` — required (min 1);
- `items[].name` — Translation object.

#### Customers

- `id` — required (min 1);
- `name` — required (min 1);
- `licenses[].licenseTypeId` — optional (default empty);
- `licenses[].MaxConnCount` — number;
- `licenses[].values` — `Record<string, unknown>`.

#### Validators

- `version` — required (min 1);
- `endpoint` — required (min 1);
- `schema` — JSON schema object;
- `method_rules` — optional method rules map.

---

## 19. Reusable UI components

The following reusable components are implemented in `src/components/`:

### Layout (`components/layout/`)

- `AppShell` — main application layout with sidebar, top bar, content area, and filter panel
- `Sidebar` — navigation sidebar with role-based menu
- `TopBar` — top bar with language selector and user name
- `FilterPanel` — configurable filter sidebar, auto-rendered based on route

### UI (`components/ui/`)

- `Table` — generic data table with sorting, loading, error, and empty states
- `Pagination` — page size selector and page navigation
- `Modal` — portal-based modal dialog with header, body, footer
- `Button` — button with variants (primary, secondary, ghost), sizes, loading state, and icon support
- `Input` — text input with label, error, hint, and type support
- `Select` — dropdown select with label and placeholder
- `Checkbox` — checkbox with label
- `Textarea` — textarea with label
- `Badge` — colored badge with variants (success, danger, info, default)
- `Tabs` — tabbed content with render-prop children
- `RowActions` — row action buttons (edit, block, unblock, history, view, custom)
- `Icons` — SVG icon components (Edit, Lock, Unlock, History, View, Plus, Trash, Copy, ChevronDown, ChevronRight)
- `ConfirmDialog` — confirmation dialog with title, message, confirm/cancel
- `ErrorBanner` — inline error message display
- `Spinner` — loading spinner with size variants

### Form (`components/form/`)

- `TranslationEditor` — multilingual input (ARM/ENG/RUS) with collapsible section
- `TagItemsEditor` — dynamic list editor for customer tag items

### Global

- `GlobalErrorModal` — renders the current error from the error queue

### Feature-specific

- `LicenseBadge` (`features/customers/`) — colored abbreviation badge for license types
- `LicenseCard` (`features/customers/`) — collapsible card for license editing with dynamic values
- `TagChip` (`features/customers/`) — compact chips for tag display
- `DiffNodeRenderer` (`utils/historyDiff.tsx`) — recursive history diff visualizer
- `SchemaBuilder` (`features/validators/`) — interactive JSON schema tree builder
- `MethodRulesEditor` (`features/validators/`) — per-HTTP-method rule configuration

---

## 20. Suggested page behavior

### 20.1 Login page

- minimalistic centered form;
- `username / password` fields with show/hide password toggle;
- language selector;
- submit on Enter;
- spinner on submit button;
- error banner for login failures.

### 20.2 Customers page

- toolbar: title + create button;
- search input;
- filter panel (right sidebar);
- table with license badges and tag chips;
- client-side sorting / filtering / paging;
- tabbed create / edit modal (General / Tags / Licenses);
- quick row actions.

### 20.3 Dictionaries pages

- the same layout pattern;
- table + create / edit modal;
- client-side sorting / paging;
- search input;
- `TranslationEditor` for multilingual name fields.

### 20.4 Validators page

- table with version and endpoint columns;
- create / edit modal with tabbed interface (Builder / JSON Preview / Method Rules);
- copy action to duplicate a validator;
- delete action with confirmation dialog.

### 20.5 History page

- filter panel (right sidebar) with date range, user, object type/id, and action type;
- table with colored action badges;
- "Show all history" button when filtered by objectId;
- details modal with recursive diff visualization.

---

## 21. Project structure

```txt
src/
  api/
    auth.ts
    client.ts
    customers.ts
    customerTags.ts
    diffPayload.ts
    employees.ts
    errorHandler.ts
    errorNormalizer.ts
    history.ts
    licenseTypes.ts
    validators.ts
  assets/
  components/
    GlobalErrorModal.tsx
    form/
      TagItemsEditor.tsx
      TranslationEditor.tsx
    layout/
      AppShell.tsx
      FilterPanel.tsx
      Sidebar.tsx
      TopBar.tsx
    ui/
      Badge.tsx
      Button.tsx
      Checkbox.tsx
      ConfirmDialog.tsx
      ErrorBanner.tsx
      Icons.tsx
      Input.tsx
      Modal.tsx
      Pagination.tsx
      RowActions.tsx
      Select.tsx
      Spinner.tsx
      Table.tsx
      Tabs.tsx
      Textarea.tsx
  constants/
    endpoints.ts
    filterConfigs.ts
    languages.ts
    routes.ts
  features/
    auth/
      LoginPage.tsx
    customers/
      CustomerModal.tsx
      CustomersPage.tsx
      LicenseBadge.tsx
      LicenseCard.tsx
      TagChip.tsx
    customerTags/
      CustomerTagModal.tsx
      CustomerTagsPage.tsx
    employees/
      EmployeeModal.tsx
      EmployeesPage.tsx
    history/
      HistoryDetailModal.tsx
      HistoryPage.tsx
    licenseTypes/
      LicenseTypeModal.tsx
      LicenseTypesPage.tsx
    validators/
      MethodRulesEditor.tsx
      SchemaBuilder.tsx
      ValidatorModal.tsx
      ValidatorsPage.tsx
      schemaUtils.ts
  hooks/
    useBlockToggle.ts
    useConfirmDialog.ts
    useCrudMutations.ts
    useFormError.ts
    useListOperations.ts
  i18n/
    index.ts
    locales/
      arm.ts
      eng.ts
      rus.ts
  providers/
    AuthProvider.tsx
    ErrorModalProvider.tsx
    FilterProvider.tsx
    QueryProvider.tsx
  routes/
    index.tsx
    ProtectedRoute.tsx
  types/
    auth.ts
    common.ts
    customer.ts
    customerTag.ts
    employee.ts
    history.ts
    licenseType.ts
    validator.ts
  utils/
    historyDiff.tsx
    licenseTypeBadge.ts
    timestamp.ts
    translation.ts
  App.tsx
  index.css
  main.tsx
  queryKeys.ts
  vite-env.d.ts
```

---
