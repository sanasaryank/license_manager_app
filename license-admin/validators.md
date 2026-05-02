# Validators

This document lists the JSON schema validators configured for each writable API endpoint.

Each entry corresponds to one `Validator` record stored in the system. The `schema` (base schema) covers all possible fields across all HTTP methods. `method_rules` adjusts which fields are required or forbidden per method.

Base URL: `https://license.trio.am`

---

## Format

Each validator record has the following shape:

```json
{
  "id":           "string (optional — auto-generated if omitted)",
  "version":      "string",
  "endpoint":     "string",
  "schema":       { "...SchemaNode..." },
  "method_rules": {
    "POST": { "forbid_fields": [], "add_required": [], "remove_required": [] },
    "PUT":  { "forbid_fields": [], "add_required": [], "remove_required": [] }
  }
}
```

`method_rules` is optional. When present, it is applied on top of the base schema to derive the effective schema for each HTTP method.

---

## Employees

**endpoint:** `/employees/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":       { "kind": "string" },
    "hash":     { "kind": "string" },
    "username": { "kind": "string" },
    "password": { "kind": "string" },
    "name": {
      "kind": "object",
      "fields": {
        "ARM": { "kind": "string" },
        "ENG": { "kind": "string" },
        "RUS": { "kind": "string" }
      },
      "required": ["ARM", "ENG", "RUS"],
      "allowExtra": false
    },
    "role":        { "kind": "string", "enum": ["admin", "superadmin"] },
    "isBlocked":   { "kind": "boolean" },
    "description": { "kind": "string" }
  },
  "required": ["username", "name", "role", "isBlocked", "description"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["id", "hash"],
    "add_required":    ["password"],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["username", "name", "role", "isBlocked", "description"]
  }
}
```

> `POST` creates a new employee. `id` is assigned by the backend. `password` is required.  
> `PUT` is a **diff update** — only changed fields are sent. `id` and `hash` are always required. `password` is omitted when unchanged.

---

## Customer Tags

**endpoint:** `/dictionary/customerTags/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":   { "kind": "string" },
    "hash": { "kind": "string" },
    "name": {
      "kind": "object",
      "fields": {
        "ARM": { "kind": "string" },
        "ENG": { "kind": "string" },
        "RUS": { "kind": "string" }
      },
      "required": ["ARM", "ENG", "RUS"],
      "allowExtra": false
    },
    "description": { "kind": "string" },
    "isBlocked":   { "kind": "boolean" },
    "items": {
      "kind": "array",
      "items": {
        "kind": "object",
        "fields": {
          "id": { "kind": "string" },
          "name": {
            "kind": "object",
            "fields": {
              "ARM": { "kind": "string" },
              "ENG": { "kind": "string" },
              "RUS": { "kind": "string" }
            },
            "required": ["ARM", "ENG", "RUS"],
            "allowExtra": false
          },
          "description": { "kind": "string" },
          "isBlocked":   { "kind": "boolean" }
        },
        "required": ["id", "name", "description", "isBlocked"],
        "allowExtra": false
      }
    }
  },
  "required": ["name", "description", "isBlocked", "items"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["hash"],
    "add_required":    [],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["name", "description", "isBlocked", "items"]
  }
}
```

> `PUT` is a **diff update**. When the `items` array is changed, it is sent in full; otherwise it is omitted.

---

## License Types

**endpoint:** `/dictionary/licenseTypes/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":   { "kind": "string" },
    "hash": { "kind": "string" },
    "name": {
      "kind": "object",
      "fields": {
        "ARM": { "kind": "string" },
        "ENG": { "kind": "string" },
        "RUS": { "kind": "string" }
      },
      "required": ["ARM", "ENG", "RUS"],
      "allowExtra": false
    },
    "fields": {
      "kind": "array",
      "items": {
        "kind": "object",
        "fields": {
          "name":     { "kind": "string" },
          "kind":     { "kind": "string", "enum": ["string", "int", "float", "date", "datetime", "time", "boolean"] },
          "required": { "kind": "boolean" },
          "enum":     { "kind": "array", "items": { "kind": "string" } }
        },
        "required": ["name", "kind", "required"],
        "allowExtra": false
      }
    },
    "isBlocked":   { "kind": "boolean" },
    "description": { "kind": "string" }
  },
  "required": ["name", "fields", "isBlocked", "description"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["hash"],
    "add_required":    [],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["name", "fields", "isBlocked", "description"]
  }
}
```

> `PUT` is a **diff update**. When the `fields` array is changed, it is sent in full; otherwise it is omitted.  
> `fields[].enum` is only meaningful when `fields[].kind === "string"`.

---

## Customers

**endpoint:** `/customers/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":   { "kind": "string" },
    "hash": { "kind": "string" },
    "name": {
      "kind": "object",
      "fields": {
        "ARM": { "kind": "string" },
        "ENG": { "kind": "string" },
        "RUS": { "kind": "string" }
      },
      "required": ["ARM", "ENG", "RUS"],
      "allowExtra": false
    },
    "legalName":     { "kind": "string" },
    "TIN":           { "kind": "string" },
    "responsibleId": { "kind": "string" },
    "tags":          { "kind": "array", "items": { "kind": "string" } },
    "licenses": {
      "kind": "array",
      "items": {
        "kind": "object",
        "fields": {
          "OrgName":       { "kind": "string" },
          "MaxConnCount":  { "kind": "integer" },
          "hwid":          { "kind": "string" },
          "licenseTypeId": { "kind": "string" },
          "versionId":     { "kind": "string" },
          "track":         { "kind": "boolean" },
          "values":        { "kind": "object", "allowExtra": true },
          "isBlocked":     { "kind": "boolean" },
          "description":   { "kind": "string" },
          "endDate":       { "kind": "string", "nullable": true }
        },
        "required": ["OrgName", "MaxConnCount", "hwid", "licenseTypeId", "track", "values", "isBlocked", "description"],
        "allowExtra": false
      }
    },
    "isBlocked":   { "kind": "boolean" },
    "description": { "kind": "string" },
    "statusId":    { "kind": "string", "nullable": true }
  },
  "required": ["name", "legalName", "TIN", "responsibleId", "tags", "licenses", "isBlocked", "description"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["hash"],
    "add_required":    ["id"],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["name", "legalName", "TIN", "responsibleId", "tags", "licenses", "isBlocked", "description"]
  }
}
```

> `POST` requires `id` (client-provided UUID). `hash` is not sent on create.  
> `PUT` is a **diff update**. When `licenses` or `tags` change, the full array is sent; otherwise it is omitted.  
> `licenses[].licenseId` is a backend-generated read-only field — it is never sent in create or update payloads.  
> `licenses[].versionId` is optional and links to a specific license version.

---

## License Versions

**endpoint:** `/dictionary/licenseVersions/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":          { "kind": "string" },
    "hash":        { "kind": "string" },
    "name":        { "kind": "string" },
    "isBlocked":   { "kind": "boolean" },
    "description": { "kind": "string" }
  },
  "required": ["name", "isBlocked", "description"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["id", "hash"],
    "add_required":    [],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["name", "isBlocked", "description"]
  }
}
```

> `POST` creates a new license version. `id` is assigned by the backend. `hash` is not sent on create.  
> `PUT` is a **diff update** — only changed fields are sent. `id` and `hash` are always required.

---

## Validators

**endpoint:** `/validators/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":       { "kind": "string" },
    "hash":     { "kind": "string" },
    "version":  { "kind": "string" },
    "endpoint": { "kind": "string" },
    "schema":   { "kind": "object", "allowExtra": true },
    "method_rules": {
      "kind": "object",
      "fields": {
        "POST": {
          "kind": "object",
          "fields": {
            "forbid_fields":   { "kind": "array", "items": { "kind": "string" } },
            "add_required":    { "kind": "array", "items": { "kind": "string" } },
            "remove_required": { "kind": "array", "items": { "kind": "string" } }
          },
          "required": [],
          "allowExtra": false
        },
        "PUT": {
          "kind": "object",
          "fields": {
            "forbid_fields":   { "kind": "array", "items": { "kind": "string" } },
            "add_required":    { "kind": "array", "items": { "kind": "string" } },
            "remove_required": { "kind": "array", "items": { "kind": "string" } }
          },
          "required": [],
          "allowExtra": false
        }
      },
      "required": [],
      "allowExtra": false
    }
  },
  "required": ["version", "endpoint", "schema"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["hash"],
    "add_required":    [],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   ["id"],
    "add_required":    ["hash"],
    "remove_required": []
  }
}
```

> `POST` creates a new validator. `id` is optional (client-provided or auto-generated by backend). `hash` is not sent on create.  
> `PUT` sends the **full object** (not a diff) plus `hash`. `id` is in the URL path, not in the request body.  
> `method_rules` is optional — when omitted or empty, the base schema applies equally to all methods.

---

## Summary table

| Endpoint | PUT strategy | `id` in POST | `hash` in PUT |
|---|---|---|---|
| `/employees/{id}` | diff (changed fields only) | no (backend-assigned) | yes |
| `/dictionary/customerTags/{id}` | diff (changed fields only) | no (backend-assigned) | yes |
| `/dictionary/licenseTypes/{id}` | diff (changed fields only) | no (backend-assigned) | yes |
| `/dictionary/licenseVersions/{id}` | diff (changed fields only) | no (backend-assigned) | yes |
| `/customers/{id}` | diff (changed fields only) | yes (client-provided UUID) | yes |
| `/validators/{id}` | full object | optional (client or backend) | yes |
| `/dictionary/customerStatuses/{id}` | diff (changed fields only) | no (backend-assigned) | yes |

---

## Customer Statuses

**endpoint:** `/dictionary/customerStatuses/{id}`  
**version:** `1.0`

**Base schema**

```json
{
  "kind": "object",
  "fields": {
    "id":   { "kind": "string" },
    "hash": { "kind": "string" },
    "name": {
      "kind": "object",
      "fields": {
        "ARM": { "kind": "string" },
        "ENG": { "kind": "string" },
        "RUS": { "kind": "string" }
      },
      "required": ["ARM", "ENG", "RUS"],
      "allowExtra": false
    },
    "color":       { "kind": "string" },
    "isBlocked":   { "kind": "boolean" },
    "description": { "kind": "string" }
  },
  "required": ["name", "color", "isBlocked", "description"],
  "allowExtra": false
}
```

**Method rules**

```json
{
  "POST": {
    "forbid_fields":   ["id", "hash"],
    "add_required":    [],
    "remove_required": []
  },
  "PUT": {
    "forbid_fields":   [],
    "add_required":    ["id", "hash"],
    "remove_required": ["name", "color", "isBlocked", "description"]
  }
}
```

> `POST` creates a new customer status. `id` and `hash` are backend-assigned.  
> `PUT` is a **diff update** — only changed fields are sent, plus `id` and `hash`.  
> `color` is a CSS hex color string (e.g. `"#6366f1"`).  
> `PATCH /dictionary/customerStatuses` with body `{ id, isBlocked }` is used for block/unblock.
