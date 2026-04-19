# Frontend Spec License Admin

## Frontend specification — License Admin

This document describes the requirements for a React frontend application for administering employees, customers, license types, customer tags, and change history.

There is also a **reference-project** in the project, which can and should be used as a base. The following parts may be copied directly from `reference-project`:

- `Login`
- `CustomerTags`
- `History`

---

## 1. Application purpose

The application is intended for an internal administrative panel.

Main functions:

- employee authentication;
- viewing and editing dictionaries;
- viewing and editing customers and their licenses;
- viewing change history;
- role-based access control.

---

## 2. Stack and general implementation expectations

Expected stack:

- React
- TypeScript
- React Router
- React Query / TanStack Query for server state
- React Hook Form for forms
- Zod / Yup for validation
- any UI kit chosen by the team

Expectations:

- SPA application;
- cookie-based session after login;
- a single API client;
- full DTO typing;
- reusable tables, forms, modals, and filters;
- a single global error modal;
- convenient optimistic locking handling via `hash`;
- diff-based update: when editing, only changed fields are sent to the backend.

---

## 3. Localization and multilingual support

The project must support **3 languages**:

- English;
- Armenian;
- Russian.

### General i18n rules

- the entire application must be fully localizable;
- **all interfaces** must work in all 3 languages;
- **all UI text elements** must come from localization files;
- **all labels for enum values** must also come from localization files;
- UI strings must not be hardcoded inside components;
- language switching must be handled through the shared application i18n layer;
- the selected language must be persisted and restored on the next app launch;
- the default application language must be determined by the project decision, for example from a saved user setting or a fallback configuration.

### What must be localized

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

All enum values displayed in the UI must be shown **not directly**, but through localization dictionaries.

Examples:

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

All translations must be stored in separate localization files, for example:

```txt
src/locales/en/...
src/locales/hy/...
src/locales/ru/...
```

The frontend must not keep enum text values or UI strings directly in component code.

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

- the frontend must hide inaccessible menu items in advance;
- the user must not see links to pages they do not have access to;
- protected routes must still check the role and redirect to the first available page if the user directly opens an inaccessible route;
- for `admin`, the first and only available page is `/customers`;
- for `superadmin`, the first page after login and also the fallback page for nonexistent or forbidden routes is `/customers`.

---

## 5. Application pages

The application has only 6 pages:

1. `Login`
2. `Customers`
3. `Dictionaries / Employees`
4. `Dictionaries / CustomerTags`
5. `Dictionaries / LicenseTypes`
6. `History`

### Routing

- `/login`
- `/customers`
- `/dictionaries/employees`
- `/dictionaries/customertags`
- `/dictionaries/licensetypes`
- `/history`

### Routing rules

- if the user is not authenticated, redirect to `/login`;
- if the user is authenticated and opens `/login`, redirect to `/customers`;
- the menu must be rendered strictly based on the role;
- `admin` must not see or open `Employees`, `CustomerTags`, `LicenseTypes`, or `History`.

---

## 6. Layout

### General structure

- left side: sidebar menu;
- right side: main page content;
- inside the main content:
  - page toolbar;
  - filter panel when needed;
  - table;
  - create / edit / view modals.

### Side menu

#### For `superadmin`

- Customers
- Dictionaries
  - Employees
  - CustomerTags
  - LicenseTypes
- History
- Logout

#### For `admin`

- Customers
- Logout

### Filter panel

The filter exists only on these pages:

- `Customers`
- `History`

The filter must be a separate collapsible component:

- opens and closes via the `Filters` button;
- filter state is stored in the page state;
- there must be a `Reset filters` button.

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

The frontend must send the cookie with all subsequent requests.

#### Response

- `200` — successful login;
- `401` — authorization error.

#### Frontend behavior

- form fields: `username`, `password`;
- after successful login, the backend sets the `license.trio.am_token` cookie;
- the frontend uses `credentials: 'include'` in all requests;
- after successful login, the frontend calls `/me` and gets the current user;
- then redirects to `/customers`.

#### Errors

- `401`: show the message “Invalid username or password”;
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

During the initial session check, if `/me` returns `401`, the frontend **must not** show an “expired session” modal. In this case, the frontend must silently clear local auth state and redirect to `/login`.

The frontend uses `/me` for:

- restoring the session after reload;
- determining the role;
- showing the user's name;
- controlling route and menu access.

### 7.3 Logout

**Endpoint:** `POST {base_url}/logout`

#### Response

- `204`

#### Frontend behavior

- call logout;
- fully clear the React Query cache (`queryClient.clear()`);
- clear user state;
- redirect to `/login`.

---

## 8. General rules for lists and entities

For all entities that have `GET list`, `GET by id`, `POST`, and `PUT`, the same UX is recommended:

- a table with the list;
- a `Create` button;
- `Edit` opens the edit form;
- `Block` changes `isBlocked` through the update flow;
- `History` opens the object's history;
- before editing, `GET /{entity}/{id}` must be called to get the latest `hash` and the source object.

### Optimistic locking

If the detail endpoint returns `hash`, then:

- detail must always be loaded before editing;
- `hash` must be sent in `PUT`;
- after successful save, list and detail queries must be invalidated.

### Block action

There are no separate `DELETE / BLOCK` endpoints. Blocking and unblocking are done through `PUT` by changing `isBlocked`.

### Partial update contract for PUT

In all `PUT` requests, the frontend sends only the changed fields, not the entire object.

General rules:

- `id` must always be included in every `PUT` payload;
- if optimistic locking is used for the entity, `hash` must also be included in the payload;
- all other fields are sent only if the user actually changed them;
- if the user opens the form and saves it without changes, no request is sent to the backend;
- comparison is done against the detail object loaded before editing;
- nested structures (`items`, `fields`, `licenses`, `values`) are sent only as whole structures, without per-item diff;
- an array is considered changed and included in the payload if its contents, including item order, differ from the original.

### Unified error handling

A shared handler for all errors and a single global error modal are required.

General rules:

- any API error must pass through a shared normalizer;
- authorization, validation, network, and unexpected errors must be displayed in a unified way;
- error text must be shown in a single shared modal / dialog;
- the error modal must support:
  - a short title;
  - a human-readable message;
  - technical details when needed;
  - a close button;
- if multiple errors occur almost at the same time, a message queue is used: the modal shows each error one by one after the previous one is closed.

### Behavior for 401

If any protected request other than the initial `/me` returns `401`:

- treat the session as expired or invalid;
- stop all local loading / submitting states;
- clear user state;
- clear query cache (`queryClient.clear()`);
- show an error modal with an “expired session” message;
- redirect to `/login`.

### Behavior for other errors

- `400 / 422`: show the backend error text or the fallback “Validation error”;
- `403`: show “Insufficient permissions”;
- `404`: show “Object not found”;
- `409`: show a conflict message or an outdated `hash` message. After closing the error, the edit form must remain open so the user can correct the data or refresh detail to get the current `hash` and retry submission;
- `5xx`: show “Internal server error”;
- network error: show “Failed to connect to the server”.

In all cases except logout and silent bootstrap `/me`, the edit form must not close automatically on error.

### Table states

Each table must support the standard states:

- `loading`
- `empty`
- `error`
- `data`

### Client-side data processing

There are no server-side filters, sorting, or pagination. All operations are performed on the client:

- client-side filtering;
- client-side sorting;
- client-side paging.

### Client-side paging

All tables require client-side pagination.

Recommended default settings:

- page size selector: `10 / 20 / 50 / 100`;
- default page size: `20`.

If the user changes filtering or sorting:

- the current page resets to the first one.

If the total number of records is smaller than the page size, the paginator is hidden or shown in an inactive state.

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
    "name": "string",
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
  "name": "string",
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
  "name": "string",
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
  "name": "string",
  "role": "string",
  "isBlocked": true
}
```

If the password was not changed, `password` is not sent. If the password was changed, `password` is included in the payload.

### 9.2 DTO

```ts
type EmployeeRole = 'admin' | 'superadmin';

interface EmployeeListItem {
  id: string;
  username: string;
  name: string;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

interface EmployeeDetail extends EmployeeListItem {
  hash: string;
}

interface EmployeeCreatePayload {
  username: string;
  password: string;
  name: string;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

interface EmployeeUpdatePayload {
  id: string;
  hash: string;
  username?: string;
  password?: string;
  name?: string;
  role?: EmployeeRole;
  isBlocked?: boolean;
  description?: string;
}
```

### 9.3 Table

Columns:

- `Name` — sortable
- `Username` — sortable
- `Role`
- `Blocked`
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 9.4 Create / edit form

Fields:

- `username` — required;
- `password` — required on create;
- `name` — required;
- `role` — select: `admin`, `superadmin`;
- `isBlocked` — switch / checkbox;
- `description` — textarea.

UX:

- load detail by `id` before editing;
- keep the original object and `hash`;
- build a diff payload on save;
- if the user did not change the password, do not send `password`;
- if the user changed nothing, do not send `PUT`.

---

## 10. LicenseTypes

### 10.1 API

#### GET list

**Endpoint:** `GET {base_url}/licenseTypes`

**Response**

```json
[
  {
    "id": "string",
    "name": "string",
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
  "name": "string",
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
  "name": "string",
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
  "name": "string",
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
type LicenseFieldKind = 'string' | 'int' | 'float' | 'date' | 'datetime' | 'time' | 'boolean';

interface LicenseTypeField {
  name: string;
  kind: LicenseFieldKind;
  required: boolean;
  enum: string[];
}

interface LicenseTypeListItem {
  id: string;
  name: string;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

interface LicenseTypeDetail extends LicenseTypeListItem {
  hash: string;
}

interface LicenseTypeCreatePayload {
  name: string;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

interface LicenseTypeUpdatePayload {
  id: string;
  hash: string;
  name?: string;
  fields?: LicenseTypeField[];
  isBlocked?: boolean;
  description?: string;
}
```

### 10.3 Rule for `enum`

The backend guarantees that the `enum` field is used only for `kind === 'string'`.

### 10.4 Table

Columns:

- `Name` — sortable
- `Fields count`
- `Blocked`
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 10.5 Create / edit form

Fields:

- `name`
- `fields` — dynamic list
- `isBlocked`
- `description`

`fields` editor:

- `name`
- `kind`
- `required`
- `enum` (an array of strings, used only for `kind === 'string'`)

UX:

- add a field;
- delete a field;
- edit `name`, `kind`, `required`, `enum`.

Rules for displaying `enum`:

- if `enum` is not empty, the frontend may use `select / radio` in dependent forms;
- if `enum` is empty, a regular input is used according to `kind`.

---

## 11. CustomerTags

### 11.1 API

#### GET list

**Endpoint:** `GET {base_url}/customerTags`

**Response**

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "isBlocked": false,
    "items": [
      {
        "id": "string",
        "name": "string",
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
  "name": "string",
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": "string",
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
  "name": "string",
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": "string",
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
  "name": "string",
  "description": "string",
  "isBlocked": false,
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "isBlocked": false
    }
  ]
}
```

### 11.2 DTO

```ts
interface CustomerTagItem {
  id: string;
  name: string;
  description: string;
  isBlocked: boolean;
}

interface CustomerTagListItem {
  id: string;
  name: string;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
  itemsCount: number;
}

interface CustomerTagDetail extends CustomerTagListItem {
  hash: string;
}

interface CustomerTagCreatePayload {
  name: string;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
}

interface CustomerTagUpdatePayload {
  id: string;
  hash: string;
  name?: string;
  description?: string;
  isBlocked?: boolean;
  items?: CustomerTagItem[];
}
```

### 11.3 Table

Columns:

- `Name` — sortable
- `ItemsCount`
- `Blocked`
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 11.4 Create / edit form

Fields:

- `name`
- `description`
- `isBlocked`
- `items` — dynamic list

Each `item`:

- `id` — editable on create, immutable after creation;
- `name`
- `description`
- `isBlocked`

UX:

- `items` are edited as a nested table or list editor;
- the user can add and remove items;
- each item `id` must be unique within one tag.

---

## 12. Customers

This is the main and most complex page.

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
  hash: string;
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
- `LicenseTypes`
- `Tags`
- `Blocked`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 12.4 Display of LicenseTypes

According to the requirements:

- show them as 2–3 letter abbreviations on colored badges;
- the same license type must always have the same abbreviation and color in all rows.

Implementation:

- build the abbreviation from `LicenseType.name` using any deterministic algorithm, for example first letters of words or the first 2–3 characters;
- store a mapping `licenseTypeId -> { abbr, color }`;
- assign the color deterministically based on `licenseTypeId` or via a palette map.

If a customer has several licenses of the same type, the table should preferably show unique type badges.

### 12.5 Display of Tags

According to the requirements:

- format: `tagname:tagitemname`.

Implementation:

- display them as compact chips, for example `Segment:VIP`, `Region:Yerevan`, `Support:Priority`;
- if there are many tags, show the first 2–3 chips;
- hide the rest under `+N` and a `tooltip / popover`.

### 12.6 Filters on the Customers page

Since `Customers` has a separate filter panel, the following filters are recommended:

- `name`
- `responsibleName`
- `licenseTypeId`
- `tag / tag item`
- `isBlocked`
- `TIN`

All filtering is client-side on top of the loaded list.

`responsibleId` is used only internally: for the API, value selection in the form, and saving.

### 12.7 Customer create / edit form

Top-level fields:

- `id` — required and editable on create;
- `name`
- `legalName`
- `TIN`
- `responsibleId`
- `tags`
- `licenses`
- `isBlocked`
- `description`

`licenses` editor:

- `licenses` — dynamic array

Each license contains:

- `OrgName`
- `MaxConnCount`
- `hwid`
- `licenseTypeId`
- `values`
- `track`
- `isBlocked`
- `description`

### Dynamic construction of `values`

When assigning a license type to a customer, the `values` field is built dynamically based on the fields defined in `licenseType.fields` for the selected `licenseTypeId`.

The field type and required validation are controlled by `fields.kind` and `fields.required` of the selected license type.

Algorithm:

1. the user selects `licenseTypeId`;
2. the frontend finds `licenseType.fields`;
3. for each `field`, the frontend creates the corresponding field inside `values`;
4. the frontend validates type and required rules on the client;
5. when `licenseTypeId` changes, the `values` fields are rebuilt.

The `LicenseTypes` dictionary must be preloaded and globally available, for example via React Query, on the `Customers` page for dynamic construction and validation of `values`.

### Rendering inputs by kind

- `string` → text input
- `int` → integer input
- `float` → decimal input
- `date` → date picker
- `datetime` → datetime picker
- `time` → time picker
- `boolean` → checkbox / switch

If a `field` has a non-empty `enum`:

- render a `select` instead of a free-text input.

### UX for licenses

On the customer form, each license is displayed as a collapsible card:

- header: license type + `OrgName` + blocked state;
- body: license fields.

### Editing behavior

- load the customer detail before editing;
- keep the original object;
- build a diff payload on save;
- if at least one element of the `licenses` array changed, send the whole `licenses` array;
- if there are no changes, do not send `PUT`.

---

## 13. History

### 13.1 API

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

### 13.2 DTO

```ts
type HistoryActionType = 'create' | 'edit' | 'delete';

interface HistoryListItemDto {
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

type HistoryDetailsDto = {
  [key: string]: HistoryDiffLeaf | HistoryDetailsDto;
};
```

### 13.3 Table

Columns:

- `Date` — sortable
- `User` — sortable by `userName`
- `ObjectType` — sortable
- `ObjectId`
- `Action` — sortable (value from `actionType`: `create`, `edit`, `delete`)
- `Actions`

Action:

- `Show details`

### 13.4 History filters

Recommended filter fields:

- date from / to;
- user;
- `objectType`;
- `objectId`;
- `actionType`.

All filters are client-side on top of the loaded list.

### 13.5 History details

It is recommended to use a modal or drawer.

Display option:

- recursively traverse the received nested diff and transform it into a flat list of rows;
- each row contains:
  - `Field path` (for example `validationSchema.fields.tags.nullable`);
  - `Old value`;
  - `New value`.

For long or nested values, a JSON viewer may be used.

### 13.6 History action from other entities

The `History` button in rows of `Employees`, `CustomerTags`, `LicenseTypes`, and `Customers` must open the object's history using:

- `/history?objectId={oid}`

UX options:

- either navigate to the `/history` page with a pre-filled `objectId` filter;
- or open a modal with the object's history list.

Preferred option: navigate to `/history` with an already applied client-side `objectId` filter and the request `/history?objectId={oid}`.

---

## 14. API layer

A single API client is required with the following rules:

- `credentials: 'include'` for sending cookies;
- a shared handler for all errors;
- error normalization;
- a convenient layer for partial `PUT` payloads;
- JSON parsing if the response contains a body.

Suggested structure:

- `authApi`
- `employeesApi`
- `customerTagsApi`
- `licenseTypesApi`
- `customersApi`
- `historyApi`

### Error normalizer

A shared helper is required to convert any error into a common shape:

```ts
interface AppError {
  status?: number;
  title: string;
  message: string;
  details?: string;
}
```

### Diff helper for update requests

A shared helper is required to build partial update payloads:

- accepts `original` and `current`;
- compares fields;
- returns only changed fields;
- then adds required `id` and `hash`.

For arrays, comparison is done by value and order. If an array changed, it is included in the payload as a whole.

---

## 15. Query keys

Example query keys:

- `['me']`
- `['employees']`
- `['employee', id]`
- `['customerTags']`
- `['customerTag', id]`
- `['licenseTypes']`
- `['licenseType', id]`
- `['customers']`
- `['customer', id]`
- `['history']`
- `['history', objectId]`
- `['historyItem', id]`

---

## 16. Sorting, filtering, and paging

According to the requirements, sortable columns are:

- Employees: `name`, `username`
- CustomerTags: `name`
- LicenseTypes: `name`
- History: `date`, `userName`, `objectType`, `actionType`
- Customers: `name`, `responsibleName`

### General rules

- sorting is fully client-side;
- filtering is fully client-side;
- pagination is fully client-side.

### Suggested implementation

Keep separate state on each list page:

- `rawData`
- `filters`
- `sort`
- `page`
- `pageSize`

Pipeline:

1. load `rawData`;
2. apply `filters`;
3. apply `sorting`;
4. take a `slice` by `page / pageSize`.

---

## 17. Forms and validation

### 17.1 General rules

- required fields must be visually marked;
- field errors must be shown under the field;
- submit is disabled while saving;
- after successful save:
  - close the modal / drawer;
  - refresh the table;
  - show a toast;
- if any error occurs, the form stays open so the user can correct the data and retry.

### 17.2 Basic validation

#### Employees

- `username` — required;
- `password` — required on create;
- `name` — required;
- `role` — required.

#### LicenseTypes

- `name` — required;
- `fields[].name` — required;
- `fields[].kind` — required;
- `fields[].required` — required boolean.

#### CustomerTags

- `name` — required;
- `items[].id` — required;
- `items[].name` — required.

#### Customers

- `id` — required on create;
- `name` — required;
- `licenses[].licenseTypeId` — required;
- `licenses[].MaxConnCount` — number;
- `licenses[].values` are validated according to `licenseType.fields`;
- if `fields.required === true`, the corresponding value inside `values` is required.

---

## 18. Reusable UI components

The following reusable components should be выделены:

- `AppLayout`
- `Sidebar`
- `PageToolbar`
- `DataTable`
- `FilterPanel`
- `ConfirmDialog`
- `EntityModal / EntityDrawer`
- `BlockedBadge`
- `LicenseTypeBadge`
- `TagChip`
- `HistoryDiffViewer`
- `DynamicFieldsEditor`
- `GlobalErrorModal`
- `FormSection`
- `Pagination`

---

## 19. Suggested page behavior

### 19.1 Login page

- minimalistic form;
- `username / password` fields;
- submit on Enter;
- spinner on submit.

### 19.2 Customers page

- toolbar: title, create button, filters toggle;
- filter panel;
- table;
- client-side sorting / filtering / paging;
- edit / create modal or drawer;
- quick row actions.

### 19.3 Dictionaries pages

- the same layout;
- table + create / edit modal;
- client-side sorting / paging;
- reusable CRUD logic.

### 19.4 History page

- toolbar + filters toggle;
- filter panel;
- table;
- client-side sorting / filtering / paging;
- details modal.

---

## 20. Suggested project structure

```txt
src/
  app/
    router/
    providers/
    layout/
  api/
    client.ts
    errorNormalizer.ts
    diffPayload.ts
    auth.ts
    employees.ts
    customerTags.ts
    licenseTypes.ts
    customers.ts
    history.ts
  locales/
    en/
    hy/
    ru/
  features/
    auth/
    employees/
    customerTags/
    licenseTypes/
    customers/
    history/
  components/
    DataTable/
    FilterPanel/
    GlobalErrorModal/
    Pagination/
    badges/
    dialogs/
  utils/
  types/
```

---

## 21. Minimum TypeScript model set

```ts
export type EmployeeRole = 'admin' | 'superadmin';
export type LicenseFieldKind = 'string' | 'int' | 'float' | 'date' | 'datetime' | 'time' | 'boolean';
export type HistoryActionType = 'create' | 'edit' | 'delete';

export interface MeDto {
  id: string;
  username: string;
  name: string;
  role: EmployeeRole;
}

export interface EmployeeDto {
  id: string;
  username: string;
  name: string;
  role: EmployeeRole;
  isBlocked: boolean;
  description: string;
}

export interface EmployeeDetailDto extends EmployeeDto {
  hash: string;
}

export interface LicenseTypeFieldDto {
  name: string;
  kind: LicenseFieldKind;
  required: boolean;
  enum: string[];
}

export interface LicenseTypeDto {
  id: string;
  name: string;
  fields: LicenseTypeFieldDto[];
  isBlocked: boolean;
  description: string;
}

export interface LicenseTypeDetailDto extends LicenseTypeDto {
  hash: string;
}

export interface CustomerTagItemDto {
  id: string;
  name: string;
  description: string;
  isBlocked: boolean;
}

export interface CustomerTagDto {
  id: string;
  name: string;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItemDto[];
  itemsCount: number;
}

export interface CustomerTagDetailDto extends CustomerTagDto {
  hash: string;
}

export interface CustomerLicenseDto {
  OrgName: string;
  MaxConnCount: number;
  hwid: string;
  licenseTypeId: string;
  track: boolean;
  values: Record<string, unknown>;
  isBlocked: boolean;
  description: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  legalName: string;
  TIN: string;
  responsibleId: string;
  responsibleName: string;
  tags: string[];
  licenses: CustomerLicenseDto[];
  isBlocked: boolean;
  description: string;
}

export interface CustomerDetailDto extends CustomerDto {
  hash: string;
}

export interface HistoryListItemDto {
  id: number;
  date: string;
  userId: string;
  userName: string;
  actionType: HistoryActionType;
  objectType: string;
  objectId: string;
}

export type HistoryDiffLeafDto = {
  old: unknown;
  new: unknown;
};

export type HistoryDetailsDto = {
  [key: string]: HistoryDiffLeafDto | HistoryDetailsDto;
};
```

---

## 22. What Claude must be able to do when generating frontend code from this specification

Claude must:

- create the React project structure;
- use `reference-project` as the base;
- directly reuse / copy `Login`, `CustomerTags`, and `History` from `reference-project` with minimal adaptation;
- take into account that the authentication logic in `reference-project` already matches this specification;
- describe DTO types;
- implement auth flow with cookie-based session;
- implement protected routes and role-based menu;
- create reusable table components;
- implement CRUD pages for `Employees`, `CustomerTags`, `LicenseTypes`, and `Customers`;
- implement dynamic forms for `fields` and `licenses`;
- implement history list + diff viewer;
- implement a single global error modal;
- implement client-side sorting / filtering / paging;
- implement support for 3 languages: English, Armenian, and Russian;
- move all UI strings and all displayed enum values into localization files;
- take into account that `PUT` requests are partial and send only changed fields.

---

## 23. Final implementation notes

1. The menu hides inaccessible sections in advance.
2. `admin` has access only to `Customers`.
3. All `PUT` payloads contain `id`.
4. All entities with optimistic locking send `hash` in `PUT`.
5. Only changed fields are sent during editing.
6. `password` for `Employee` is sent only if it was changed.
7. `licenseType.fields.required` controls required validation of dynamic fields in customer licenses.
8. The backend guarantees that `enum` is used only for `kind === 'string'`.
9. `customers.tags` is present in both list and detail responses.
10. `CustomerTags.itemsCount` is present in the response.
11. `History` is sorted and displayed by `userName`.
12. All list screens use client-side paging.
13. All errors are shown through a single global error modal.
14. `Login`, `CustomerTags`, and `History` may be taken from `reference-project`.
15. The initial `/me` returning `401` uses silent redirect without an expired-session modal.
16. `responsibleName` is used in the table and filters, while `responsibleId` is used only internally and for the API.
17. The project must support 3 languages: English, Armenian, and Russian.
18. All interfaces and all displayed enum values must come from localization files.
