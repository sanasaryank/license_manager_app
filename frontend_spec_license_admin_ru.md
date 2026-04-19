# Frontend Spec License Admin

## Frontend specification — License Admin

Документ описывает требования к frontend-приложению на React для администрирования сотрудников, клиентов, типов лицензий, тегов клиентов и истории изменений.

Также в проекте есть **reference-project**, который можно и нужно использовать как основу. Следующие части разрешено копировать напрямую из `reference-project`:

- `Login`
- `CustomerTags`
- `History`

---

## 1. Назначение приложения

Приложение предназначено для внутренней административной панели.

Основные функции:

- аутентификация сотрудника;
- просмотр и редактирование справочников;
- просмотр и редактирование клиентов и их лицензий;
- просмотр истории изменений;
- разграничение доступа по ролям.

---

## 2. Stack и общие ожидания к реализации

Предполагаемый стек:

- React
- TypeScript
- React Router
- React Query / TanStack Query для серверного состояния
- React Hook Form для форм
- Zod / Yup для валидации
- UI kit по выбору команды

Ожидания:

- SPA-приложение;
- cookie-based session после логина;
- единый API client;
- типизация всех DTO;
- переиспользуемые таблицы, формы, модальные окна и фильтры;
- единый модал показа ошибок;
- удобная работа с optimistic locking через `hash`;
- diff-based update: при редактировании на backend отправляются только изменённые поля.

---

## 3. Локализация и мультиязычность

Проект должен поддерживать **3 языка**:

- английский;
- армянский;
- русский.

### Общие правила i18n

- всё приложение должно быть полностью локализуемым;
- **все интерфейсы** должны работать на 3 языках;
- **все текстовые элементы UI** должны браться из файлов локализации;
- **все подписи для энумераций** также должны браться из файлов локализации;
- строки интерфейса не должны быть захардкожены в компонентах;
- язык должен переключаться через общий i18n-слой приложения;
- выбранный язык должен сохраняться и восстанавливаться при следующем открытии приложения;
- по умолчанию язык приложения должен определяться проектным решением (например, по сохранённой настройке пользователя или по fallback-конфигурации).

### Что обязательно должно локализоваться

- названия пунктов меню;
- заголовки страниц;
- подписи кнопок;
- заголовки и названия колонок таблиц;
- плейсхолдеры;
- тексты ошибок;
- сообщения в модальных окнах;
- названия действий;
- подписи фильтров;
- значения статусов;
- подписи для enum-значений.

### Локализация enum-значений

Все enum-значения отображаются в UI **не напрямую**, а через словари локализации.

Примеры:

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

### Источник переводов

Все переводы должны храниться в отдельных файлах локализации, например:

```txt
src/locales/en/...
src/locales/hy/...
src/locales/ru/...
```

Фронтенд не должен хранить текстовые значения enum или UI-строк прямо в коде компонентов.

---

## 4. Роли и права доступа

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

### Права доступа

- `superadmin`:
  - доступ ко всем страницам;
- `admin`:
  - доступ только к странице `Customers`.

### Правила доступа во frontend

- фронтенд должен заранее скрывать недоступные пункты меню;
- пользователь не должен видеть ссылки на страницы, к которым у него нет доступа;
- protected routes всё равно должны проверять роль и при прямом переходе на недоступный route делать redirect на первую доступную страницу;
- для `admin` первой и единственной доступной страницей является `/customers`;
- для `superadmin` первой страницей после входа и при попытке доступа к несуществующему или запрещённому маршруту также является `/customers`.

---

## 5. Страницы приложения

В приложении всего 6 страниц:

1. `Login`
2. `Customers`
3. `Dictionaries / Employees`
4. `Dictionaries / CustomerTags`
5. `Dictionaries / LicenseTypes`
6. `History`

### Маршрутизация

- `/login`
- `/customers`
- `/dictionaries/employees`
- `/dictionaries/customertags`
- `/dictionaries/licensetypes`
- `/history`

### Правила маршрутизации

- если пользователь не авторизован — redirect на `/login`;
- если авторизован и открывает `/login`, делать redirect на `/customers`;
- меню рендерится строго на основе роли;
- `admin` не видит и не открывает `Employees`, `CustomerTags`, `LicenseTypes`, `History`.

---

## 6. Layout

### Общая структура

- слева: боковое меню;
- справа: основной контент страницы;
- в основном контенте:
  - toolbar страницы;
  - при необходимости фильтр-панель;
  - таблица;
  - модальные окна создания / редактирования / просмотра.

### Side menu

#### Для `superadmin`

- Customers
- Dictionaries
  - Employees
  - CustomerTags
  - LicenseTypes
- History
- Logout

#### Для `admin`

- Customers
- Logout

### Filter panel

Фильтр есть только на страницах:

- `Customers`
- `History`

Фильтр должен быть отдельным скрываемым компонентом:

- по кнопке `Filters` открывается и закрывается;
- состояние фильтров хранится в state страницы;
- должна быть кнопка `Reset filters`.

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

Backend устанавливает server-side cookie:

```txt
license.trio.am_token
```

Фронтенд должен отправлять cookie со всеми последующими запросами.

#### Response

- `200` — успешный вход;
- `401` — ошибка авторизации.

#### Поведение фронтенда

- форма: `username`, `password`;
- при успешном логине backend устанавливает cookie `license.trio.am_token`;
- frontend использует `credentials: 'include'` во всех запросах;
- после успешного логина фронтенд вызывает `/me` и получает текущего пользователя;
- затем redirect на `/customers`.

#### Ошибки

- `401`: показать сообщение “Неверный логин или пароль”;
- остальные ошибки: через единый глобальный механизм показа ошибок.

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

При отсутствии или невалидной cookie эндпоинт возвращает `401`.

#### Специальное правило для bootstrap `/me`

При стартовой проверке сессии запрос `/me`, вернувший `401`, **не должен** показывать modal об истекшей сессии. В этом случае frontend должен тихо очистить локальное состояние авторизации и выполнить redirect на `/login`.

Фронтенд использует `/me` для:

- восстановления сессии после reload;
- определения роли;
- отображения имени пользователя;
- контроля доступа к роутам и меню.

### 7.3 Logout

**Endpoint:** `POST {base_url}/logout`

#### Response

- `204`

#### Поведение фронтенда

- вызвать logout;
- полностью очистить кэш React Query (`queryClient.clear()`);
- очистить user state;
- redirect на `/login`.

---

## 8. Общие правила работы со списками и сущностями

Для всех сущностей, где есть `GET list`, `GET by id`, `POST`, `PUT`, рекомендуется единый UX:

- таблица со списком;
- кнопка `Create`;
- `Edit` открывает форму редактирования;
- `Block` меняет `isBlocked` через update flow;
- `History` открывает историю по объекту;
- для редактирования сначала вызывается `GET /{entity}/{id}` для получения актуального `hash` и исходного объекта.

### Optimistic locking

Если detail endpoint возвращает `hash`, то:

- перед редактированием обязательно читать detail;
- при сохранении отправлять `hash` в `PUT`;
- после успешного сохранения инвалидировать список и detail query.

### Block action

Отдельных `DELETE / BLOCK` endpoints нет. Блокировка и разблокировка выполняются через `PUT` с изменением `isBlocked`.

### Partial update contract for PUT

Во всех `PUT` запросах frontend отправляет только изменённые поля, а не весь объект целиком.

Общие правила:

- в payload каждого `PUT` обязательно включается `id`;
- если для сущности используется optimistic locking, в payload обязательно включается `hash`;
- все остальные поля отправляются только если пользователь действительно их изменил;
- если пользователь открыл форму и сохранил её без изменений, запрос на backend не отправляется;
- сравнение делается относительно detail-объекта, полученного перед редактированием;
- для вложенных структур (`items`, `fields`, `licenses`, `values`) отправка выполняется только целиком, без поэлементного diff;
- массив считается изменённым и включается в payload, если его содержимое, включая порядок элементов, отличается от исходного.

### Единая обработка ошибок

Нужен общий обработчик всех ошибок и единый глобальный error modal.

Общие правила:

- любой API error должен проходить через общий normalizer;
- ошибки авторизации, валидации, сетевые ошибки и неожиданные ошибки показываются единообразно;
- текст ошибки показывается в одном общем modal / dialog;
- error modal должен уметь показывать:
  - короткий заголовок;
  - человекочитаемое сообщение;
  - технические детали при необходимости;
  - кнопку закрытия;
- если несколько ошибок происходят почти одновременно, используется очередь сообщений: модал последовательно показывает каждую ошибку после закрытия предыдущей.

### Поведение для 401

Если любой защищённый запрос, кроме стартового `/me`, вернул `401`:

- считать сессию истёкшей или невалидной;
- закрыть все локальные loading / submitting states;
- очистить user state;
- очистить query cache (`queryClient.clear()`);
- показать error modal с сообщением об истекшей сессии;
- redirect на `/login`.

### Поведение для остальных ошибок

- `400 / 422`: показать текст backend-ошибки или fallback “Ошибка валидации данных”;
- `403`: показать “Недостаточно прав”;
- `404`: показать “Объект не найден”;
- `409`: показать сообщение о конфликте данных или устаревшем `hash`. После закрытия ошибки форма редактирования остаётся открытой, пользователь может исправить данные или обновить detail для получения актуального `hash` и повторить отправку;
- `5xx`: показать “Внутренняя ошибка сервера”;
- network error: показать “Не удалось соединиться с сервером”.

Во всех случаях, кроме logout и silent bootstrap-check `/me`, форма редактирования не закрывается автоматически при ошибке.

### Состояния таблиц

У каждой таблицы должны быть стандартные состояния:

- `loading`
- `empty`
- `error`
- `data`

### Клиентская обработка данных

Серверные фильтры, серверная сортировка и серверная пагинация отсутствуют. Все операции выполняются на клиенте:

- client-side filtering;
- client-side sorting;
- client-side paging.

### Client-side paging

Для всех таблиц нужна клиентская пагинация.

Рекомендуемые параметры по умолчанию:

- page size selector: `10 / 20 / 50 / 100`;
- default page size: `20`.

Если пользователь меняет фильтр или сортировку:

- текущая страница сбрасывается на первую.

Если общее количество записей меньше размера страницы, пагинатор скрывается или отображается в неактивном виде.

---

## 9. Employees

Раздел доступен только для роли `superadmin`.

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

`PUT` отправляет только изменённые поля + обязательные технические поля.

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

Если пароль не менялся, поле `password` не отправляется. Если пароль менялся, поле `password` включается в payload.

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

### 9.3 Таблица

Колонки:

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

### 9.4 Форма создания / редактирования

Поля:

- `username` — обязательное;
- `password` — обязательное при создании;
- `name` — обязательное;
- `role` — select: `admin`, `superadmin`;
- `isBlocked` — switch / checkbox;
- `description` — textarea.

UX:

- при редактировании загрузить detail по `id`;
- хранить исходный объект и `hash`;
- при сохранении построить diff payload;
- если пользователь не изменил пароль, `password` не отправлять;
- если пользователь не изменил ничего, `PUT` не отправлять.

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

`PUT` отправляет только изменённые поля + обязательные технические поля.

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

### 10.3 Правило для enum

Backend гарантирует, что поле `enum` используется только для `kind === 'string'`.

### 10.4 Таблица

Колонки:

- `Name` — sortable
- `Fields count`
- `Blocked`
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 10.5 Форма создания / редактирования

Поля:

- `name`
- `fields` — dynamic list
- `isBlocked`
- `description`

Редактор `fields`:

- `name`
- `kind`
- `required`
- `enum` (массив строк, применяется только для `kind === 'string'`)

UX:

- добавить поле;
- удалить поле;
- редактировать `name`, `kind`, `required`, `enum`.

Правила отображения `enum`:

- если `enum` непустой, фронтенд может использовать `select / radio` в зависимых формах;
- если `enum` пустой, используется обычный input по `kind`.

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

`PUT` отправляет только изменённые поля + обязательные технические поля. Если массив `items` изменился, он отправляется целиком.

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

### 11.3 Таблица

Колонки:

- `Name` — sortable
- `ItemsCount`
- `Blocked`
- `Description`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 11.4 Форма создания / редактирования

Поля:

- `name`
- `description`
- `isBlocked`
- `items` — dynamic list

Каждый `item`:

- `id` — редактируемое при создании, неизменяемое после создания;
- `name`
- `description`
- `isBlocked`

UX:

- `items` редактируются как вложенная таблица или list editor;
- пользователь может добавлять и удалять items;
- `id` item должен быть уникальным в пределах одного тега.

---

## 12. Customers

Это основная и наиболее сложная страница.

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

`PUT` отправляет только изменённые поля + обязательные технические поля.

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

### 12.3 Таблица

Колонки:

- `Name` — sortable
- `Responsible` — sortable по `responsibleName`
- `LicenseTypes`
- `Tags`
- `Blocked`
- `Actions`

Actions:

- `Edit`
- `Block`
- `History`

### 12.4 Отображение LicenseTypes

По ТЗ:

- показывать как 2–3 буквенную аббревиатуру на цветном badge;
- у одного и того же типа лицензии аббревиатура и цвет должны быть одинаковыми во всех строках.

Реализация:

- формировать abbreviation из `LicenseType.name` (алгоритм на усмотрение разработчика, например первые буквы слов или первые 2–3 символа);
- хранить маппинг `licenseTypeId -> { abbr, color }`;
- цвет назначать детерминированно на основе `licenseTypeId` или через palette map.

Если у клиента несколько лицензий одного типа, в таблице предпочтительно показывать уникальные badge типов.

### 12.5 Отображение Tags

По ТЗ:

- формат `tagname:tagitemname`.

Реализация:

- отображать в виде компактных chips, например `Segment:VIP`, `Region:Yerevan`, `Support:Priority`;
- если тегов много, показать первые 2–3 chips;
- остальные скрыть под `+N` и `tooltip / popover`.

### 12.6 Фильтры страницы Customers

Так как `Customers` имеет отдельный filter panel, рекомендуется поддержать:

- `name`
- `responsibleName`
- `licenseTypeId`
- `tag / tag item`
- `isBlocked`
- `TIN`

Все фильтры выполняются на клиенте поверх загруженного списка.

`responsibleId` используется только внутренне: для API, выбора значения в форме и сохранения.

### 12.7 Форма создания / редактирования клиента

Поля верхнего уровня:

- `id` — обязательное и редактируемое при создании;
- `name`
- `legalName`
- `TIN`
- `responsibleId`
- `tags`
- `licenses`
- `isBlocked`
- `description`

Редактор `licenses`:

- `licenses` — dynamic array

Каждая лицензия содержит:

- `OrgName`
- `MaxConnCount`
- `hwid`
- `licenseTypeId`
- `values`
- `track`
- `isBlocked`
- `description`

### Динамическое построение `values`

При добавлении типа лицензии пользователю поле `values` создаётся динамически на основании полей, заданных в `licenseType.fields` для выбранного `licenseTypeId`.

Тип поля и обязательность заполнения контролируются полями `fields.kind` и `fields.required` выбранного типа лицензии.

Алгоритм:

1. пользователь выбирает `licenseTypeId`;
2. frontend находит `licenseType.fields`;
3. для каждого `field` создаёт соответствующее поле в `values`;
4. frontend валидирует тип и required на клиенте;
5. при смене `licenseTypeId` набор полей `values` пересобирается.

Справочник `LicenseTypes` должен быть предварительно загружен и доступен глобально, например через React Query, на странице `Customers` для динамического построения и валидации полей `values`.

### Рендеринг inputs по kind

- `string` → text input
- `int` → integer input
- `float` → decimal input
- `date` → date picker
- `datetime` → datetime picker
- `time` → time picker
- `boolean` → checkbox / switch

Если у `field` есть `enum` и он не пустой:

- рендерить `select` вместо свободного input.

### UX для licenses

На форме клиента каждая лицензия отображается как collapsible card:

- header: тип лицензии + `OrgName` + blocked state;
- body: поля лицензии.

### Поведение редактирования

- перед редактированием загрузить detail клиента;
- хранить исходный объект;
- при сохранении сформировать diff payload;
- если изменился хотя бы один элемент массива `licenses`, весь массив `licenses` отправляется целиком;
- если изменений нет, `PUT` не отправлять.

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

Такой же, как у `GET /history`.

#### GET details

**Endpoint:** `GET {base_url}/historyItem/{id}`

**Response**

Ответ представляет собой nested object diff. Каждое изменённое поле описывается объектом вида:

```json
{
  "old": "any",
  "new": "any"
}
```

Для вложенных объектов структура повторяется рекурсивно.

Пример:

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

### 13.3 Таблица

Колонки:

- `Date` — sortable
- `User` — sortable по `userName`
- `ObjectType` — sortable
- `ObjectId`
- `Action` — sortable (значение из `actionType`: `create`, `edit`, `delete`)
- `Actions`

Action:

- `Show details`

### 13.4 Фильтры History

Рекомендуемые поля фильтра:

- дата от / до;
- пользователь;
- `objectType`;
- `objectId`;
- `actionType`.

Все фильтры выполняются на клиенте поверх загруженного списка.

### 13.5 History details

Рекомендуется использовать modal или drawer.

Вариант отображения:

- полученный nested diff рекурсивно обходится и преобразуется в плоский список строк;
- каждая строка:
  - `Field path` (например `validationSchema.fields.tags.nullable`);
  - `Old value`;
  - `New value`.

Для длинных и nested значений можно использовать JSON viewer.

### 13.6 History action из других сущностей

Кнопка `History` в строках `Employees`, `CustomerTags`, `LicenseTypes`, `Customers` должна открывать историю объекта через запрос:

- `/history?objectId={oid}`

UX-варианты:

- либо переход на страницу `/history` с предзаполненным фильтром `objectId`;
- либо открытие модала со списком истории объекта.

Предпочтительный вариант: переход на страницу `/history` с уже установленным client-side фильтром и запросом `/history?objectId={oid}`.

---

## 14. API layer

Нужен единый API client с общими правилами:

- `credentials: 'include'` для отправки cookie;
- общий обработчик всех ошибок;
- нормализация ошибок;
- удобный слой для частичных `PUT` payload;
- парсинг JSON, если ответ содержит тело.

Предлагаемая структура:

- `authApi`
- `employeesApi`
- `customerTagsApi`
- `licenseTypesApi`
- `customersApi`
- `historyApi`

### Error normalizer

Нужен единый helper, который преобразует любой error к общему виду:

```ts
interface AppError {
  status?: number;
  title: string;
  message: string;
  details?: string;
}
```

### Diff helper for update requests

Нужен единый helper для формирования partial update payload:

- принимает `original` и `current`;
- сравнивает поля;
- возвращает объект только с изменениями;
- затем добавляет обязательные `id` и `hash`.

Для массивов сравнение выполняется по значению элементов и их порядку. Если массив изменился, он включается в payload целиком.

---

## 15. Query keys

Пример query keys:

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

## 16. Sorting, filtering and paging

По ТЗ sortable-колонки:

- Employees: `name`, `username`
- CustomerTags: `name`
- LicenseTypes: `name`
- History: `date`, `userName`, `objectType`, `actionType`
- Customers: `name`, `responsibleName`

### Общие правила

- сортировка полностью клиентская;
- фильтрация полностью клиентская;
- пагинация полностью клиентская.

### Suggested implementation

На каждой странице списка держать отдельный state:

- `rawData`
- `filters`
- `sort`
- `page`
- `pageSize`

Pipeline:

1. загрузить `rawData`;
2. применить `filters`;
3. применить `sorting`;
4. взять `slice` по `page / pageSize`.

---

## 17. Формы и валидация

### 17.1 Общие правила

- обязательные поля визуально отмечаются;
- ошибки показываются под полем;
- submit disabled во время сохранения;
- после успешного сохранения:
  - закрыть modal / drawer;
  - обновить таблицу;
  - показать toast;
- при возникновении любой ошибки форма остаётся открытой, пользователь может исправить данные и повторить отправку.

### 17.2 Базовая валидация

#### Employees

- `username` — required;
- `password` — required на create;
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

- `id` — required на create;
- `name` — required;
- `licenses[].licenseTypeId` — required;
- `licenses[].MaxConnCount` — number;
- `licenses[].values` валидируются по `licenseType.fields`;
- если поле `fields.required === true`, соответствующее значение в `values` обязательно.

---

## 18. Переиспользуемые UI-компоненты

Нужно выделить переиспользуемые компоненты:

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

- минималистичная форма;
- поля `username / password`;
- submit по Enter;
- spinner на submit.

### 19.2 Customers page

- toolbar: title, create button, filters toggle;
- filter panel;
- table;
- client-side sorting / filtering / paging;
- edit / create modal или drawer;
- быстрые действия в строке.

### 19.3 Dictionaries pages

- одинаковый layout;
- таблица + create / edit modal;
- client-side sorting / paging;
- переиспользуемая логика CRUD.

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

## 21. Минимальный набор TypeScript-моделей

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

## 22. Что должен уметь Claude при генерации frontend-кода по этой спецификации

Claude должен:

- создать структуру React-проекта;
- использовать `reference-project` как основу;
- напрямую переиспользовать / копировать `Login`, `CustomerTags`, `History` из `reference-project` с минимальной адаптацией;
- учитывать, что логика аутентификации в `reference-project` уже соответствует данной спецификации;
- описать типы DTO;
- сделать auth flow с cookie session;
- реализовать protected routes и role-based menu;
- сделать reusable table components;
- сделать CRUD страницы для `Employees`, `CustomerTags`, `LicenseTypes`, `Customers`;
- сделать dynamic forms для `fields` и `licenses`;
- сделать history list + diff viewer;
- реализовать единый global error modal;
- реализовать client-side sorting / filtering / paging;
- реализовать поддержку 3 языков: английского, армянского и русского;
- вынести все строки интерфейса и все отображаемые enum-значения в файлы локализации;
- учитывать, что `PUT` запросы частичные и отправляют только изменённые поля.

---

## 23. Final implementation notes

1. Меню скрывает недоступные разделы заранее.
2. `admin` имеет доступ только к `Customers`.
3. Все `PUT` payload содержат `id`.
4. Все сущности с optimistic locking отправляют `hash` в `PUT`.
5. При редактировании отправляются только изменённые поля.
6. `password` у `Employee` отправляется только если был изменён.
7. `licenseType.fields.required` управляет обязательностью динамических полей в лицензии клиента.
8. Backend гарантирует, что `enum` используется только для `kind === 'string'`.
9. `customers.tags` присутствует и в list response, и в detail response.
10. `CustomerTags.itemsCount` присутствует в response.
11. `History` сортируется и отображается по `userName`.
12. Все list screens используют client-side paging.
13. Все ошибки показываются через единый глобальный error modal.
14. `Login`, `CustomerTags`, `History` можно брать из `reference-project`.
15. Для стартового `/me` с `401` используется silent redirect без модала об истекшей сессии.
16. `responsibleName` используется в таблице и фильтрах, `responsibleId` — только внутренне и для API.
17. Проект должен поддерживать 3 языка: английский, армянский и русский.
18. Все интерфейсы и все отображаемые enum-значения должны браться из файлов локализации.