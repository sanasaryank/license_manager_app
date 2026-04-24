# API Reference

Base URL: `https://license.trio.am`

All requests include `credentials: 'include'` (cookie-based auth).  
When running on localhost, all requests also include the header `X-Origin: license.trio.am`.

---

## Common types

```ts
interface Translation {
  ARM: string;
  ENG: string;
  RUS: string;
}
```

---

## Auth

### POST /login

Authenticate a user.

**Request headers**
```
Authorization: Basic base64(username:password)
```

**Response**
- `200` — success; server sets session cookie `license.trio.am_token`
- `401` — invalid credentials

---

### GET /me

Get the currently authenticated user.

**Response `200`**
```json
{
  "id": "string",
  "username": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "admin | superadmin"
}
```

- `401` — not authenticated

---

### POST /logout

End the current session.

**Response**
- `204`

---

## Employees

### GET /employees

Get all employees.

**Response `200`**
```json
[
  {
    "id": "string",
    "username": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "role": "admin | superadmin",
    "isBlocked": false,
    "description": "string"
  }
]
```

---

### GET /employees/:id

Get employee by ID.

**Response `200`**
```json
{
  "id": "string",
  "username": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "admin | superadmin",
  "isBlocked": false,
  "description": "string",
  "hash": "string"
}
```

---

### POST /employees

Create a new employee.

**Request body**
```json
{
  "username": "string",
  "password": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "admin | superadmin",
  "isBlocked": false,
  "description": "string"
}
```

**Response `200`** — created employee (same shape as GET by ID)

---

### PUT /employees/:id

Update an employee. Only changed fields are sent (diff update). `id` and `hash` are always included. `password` is omitted if unchanged.

**Request body**
```json
{
  "id": "string",
  "hash": "string",
  "username": "string",
  "password": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "admin | superadmin",
  "isBlocked": false,
  "description": "string"
}
```

Block/unblock shortcut — only `id` and `isBlocked` are sent:
```json
{ "id": "string", "isBlocked": true }
```

**Response `200`** — updated employee

---

## Customer Tags

### GET /dictionary/customerTags

Get all customer tags.

**Response `200`**
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

---

### GET /dictionary/customerTags/:id

Get customer tag by ID.

**Response `200`**
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

---

### POST /dictionary/customerTags

Create a new customer tag.

**Request body**
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

**Response `200`** — created tag (same shape as GET by ID)

---

### PUT /dictionary/customerTags/:id

Update a customer tag. Only changed fields are sent. If `items` changed, the full array is sent.

**Request body**
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

**Response `200`** — updated tag

---

## License Types

### GET /dictionary/licenseTypes

Get all license types.

**Response `200`**
```json
[
  {
    "id": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "fields": [
      {
        "name": "string",
        "kind": "string | int | float | date | datetime | time | boolean",
        "required": true,
        "enum": ["string"]
      }
    ],
    "isBlocked": false,
    "description": "string"
  }
]
```

---

### GET /dictionary/licenseTypes/:id

Get license type by ID.

**Response `200`**
```json
{
  "id": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string | int | float | date | datetime | time | boolean",
      "required": true,
      "enum": ["string"]
    }
  ],
  "isBlocked": false,
  "description": "string",
  "hash": "string"
}
```

---

### POST /dictionary/licenseTypes

Create a new license type.

**Request body**
```json
{
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string | int | float | date | datetime | time | boolean",
      "required": true,
      "enum": ["string"]
    }
  ],
  "isBlocked": false,
  "description": "string"
}
```

**Response `200`** — created license type (same shape as GET by ID)

---

### PUT /dictionary/licenseTypes/:id

Update a license type. Only changed fields are sent. If `fields` changed, the full array is sent.

**Request body**
```json
{
  "id": "string",
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "fields": [
    {
      "name": "string",
      "kind": "string | int | float | date | datetime | time | boolean",
      "required": true,
      "enum": ["string"]
    }
  ],
  "isBlocked": false,
  "description": "string"
}
```

**Response `200`** — updated license type

---

## Customers

### GET /customers

Get all customers.

**Response `200`**
```json
[
  {
    "id": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "legalName": "string",
    "TIN": "string",
    "responsibleId": "string",
    "tags": ["string"],
    "licenses": [
      {
        "OrgName": "string",
        "MaxConnCount": 0,
        "hwid": "string",
        "licenseTypeId": "string",
        "track": false,
        "values": {},
        "isBlocked": false,
        "description": "string",
        "endDate": "string | null"
      }
    ],
    "isBlocked": false,
    "description": "string",
    "lastUpdated": "string | null"
  }
]
```

> `lastUpdated` is returned by the list endpoint only. It reflects the server-side modification timestamp exactly as received — no timezone conversion is applied.

---

### GET /customers/:id

Get customer by ID.

**Response `200`**
```json
{
  "id": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "responsibleName": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 0,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": false,
      "values": {},
      "isBlocked": false,
        "description": "string",
        "endDate": "string | null"

### POST /customers

Create a new customer.

**Request body**
```json
{
  "id": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 0,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": false,
      "values": {},
      "isBlocked": false,
      "description": "string",
      "endDate": "string | null"
    }
  ],
  "isBlocked": false,
  "description": "string"
}
```

**Response `200`** — created customer (same shape as GET by ID)

---

### PUT /customers/:id

Update a customer. Only changed fields are sent. If `licenses` or `tags` changed, the full array is sent.

**Request body**
```json
{
  "id": "string",
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "legalName": "string",
  "TIN": "string",
  "responsibleId": "string",
  "tags": ["string"],
  "licenses": [
    {
      "OrgName": "string",
      "MaxConnCount": 0,
      "hwid": "string",
      "licenseTypeId": "string",
      "track": false,
      "values": {},
      "isBlocked": false,
      "description": "string",
      "endDate": "string | null"
    }
  ],
  "isBlocked": false,
  "description": "string"
}
```

**Response `200`** — updated customer

---

## Validators

### GET /validators

Get all validators.

**Response `200`**
```json
[
  {
    "id": "string",
    "version": "string",
    "endpoint": "string",
    "schema": { "kind": "object", "fields": {}, "required": [], "allowExtra": true },
    "method_rules": {
      "POST": {
        "forbid_fields": ["string"],
        "add_required": ["string"],
        "remove_required": ["string"]
      }
    }
  }
]
```

---

### GET /validators/:id

Get validator by ID.

**Response `200`**
```json
{
  "id": "string",
  "version": "string",
  "endpoint": "string",
  "schema": { "kind": "object", "fields": {}, "required": [], "allowExtra": true },
  "method_rules": {},
  "hash": "string"
}
```

---

### POST /validators

Create a new validator.

**Request body**
```json
{
  "id": "string (optional)",
  "version": "string",
  "endpoint": "string",
  "schema": { "kind": "object", "fields": {}, "required": [], "allowExtra": true },
  "method_rules": {}
}
```

**Response `200`** — created validator

---

### PUT /validators/:id

Update a validator. Sends the **full object** (not a diff) plus `hash`.

**Request body**
```json
{
  "version": "string",
  "endpoint": "string",
  "schema": { "kind": "object", "fields": {}, "required": [], "allowExtra": true },
  "method_rules": {},
  "hash": "string"
}
```

**Response `200`** — updated validator

---

### DELETE /validators/:id

Delete a validator.

**Response**
- `204`

---

## History

### GET /history

Get all history records.

**Response `200`**
```json
[
  {
    "id": 1,
    "date": "2026-04-20",
    "userId": "string",
    "actionType": "create | edit | delete",
    "objectType": "string",
    "objectId": "string"
  }
]
```

---

### GET /history?objectId=:objectId

Get history records filtered by object ID.

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `objectId` | string | ID of the object to filter by |

**Response `200`** — same shape as `GET /history`

---

### GET /historyItem/:id

Get the diff details for a specific history record.

**Response `200`**

A recursive diff object. Each changed field is a leaf node with `old` and `new` values. Nested objects repeat the structure recursively.

```json
{
  "fieldName": {
    "old": "previous value",
    "new": "new value"
  },
  "nestedObject": {
    "nestedField": {
      "old": "<missing>",
      "new": "value"
    }
  }
}
```

The sentinel value `"<missing>"` indicates the field did not exist before.

---

## Error responses

All endpoints may return the following error responses:

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Not authenticated or session expired |
| `403` | Insufficient permissions |
| `404` | Object not found |
| `409` | Conflict (optimistic locking — another user modified the record) |
| `422` | Unprocessable entity |
| `5xx` | Server error |

Error response body (when available):
```json
{
  "message": "string"
}
```
