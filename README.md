# sellgar.admin.gateway

`sellgar.admin.gateway` - backend gateway для admin UI.

Пакет является edge/BFF слоем между админским frontend и внутренними сервисами Sellgar. Gateway принимает HTTP-запросы от admin UI, проверяет transport state авторизации, вызывает downstream services и возвращает единый HTTP response.

## Зона ответственности

Gateway отвечает за:

- HTTP API для admin UI;
- transport cookie для admin session;
- преобразование request/response DTO публичного admin API;
- вызовы `identity.service` и `product.service` через RabbitMQ;
- вызовы `file.service` по HTTP.

Gateway не должен владеть доменной логикой сервисов, базами данных, MinIO storage, RabbitMQ installation scripts или общей dev-инфрой workspace.

## Downstream services

Для полноценного локального запуска нужны:

- `sellgar.identity.service` - auth/session/user/profile/role/token контракты;
- `sellgar.product.service` - product/catalog/property/category/variant контракты;
- `sellgar.shop.service` - shop/channel контракты;
- `sellgar.store.service` - store product, offer, price, currency и inventory контракты;
- `sellgar.cart.service` - административный просмотр корзин и изменение их состава;
- `sellgar.file.service` - file/folder HTTP API и upload/download flows;
- RabbitMQ - transport для команд и событий identity/product;
- MinIO - не прямая зависимость gateway, используется через `file.service`.

## Текущая структура

Репозиторий схлопнут в одиночный package:

```text
.
├── code/                 # package.json, Yarn, src/, local .env
├── helm/
│   ├── values.app.yaml   # shared chart settings
│   ├── dev/values.yaml   # dev ConfigMap
│   └── prod/values.yaml  # production values, not activated yet
├── .github/              # CI and manual release promotion
├── Dockerfile
├── README.md
└── AGENTS.md
```

## Установка

Из каталога `code/`:

```bash
yarn install
```

Репозиторий использует Yarn 4.18.0 и `nodeLinker: node-modules`.

Требуемая версия Node.js: 24+.

## Локальный запуск

Подготовить env:

```bash
cp .env.example .env
```

Проверить, что в `.env` есть адреса RabbitMQ и downstream services. Приложение валидирует обязательные env keys при старте и завершится с явной ошибкой, если ключ отсутствует или числовой ключ задан не числом.

Cookie policy задается через:

- `AUTH_COOKIE` - имя cookie;
- `AUTH_COOKIE_SECURE` - `true` для HTTPS окружений, `false` для локального HTTP;
- `AUTH_COOKIE_SAME_SITE` - `strict`, `lax` или `none`.

Gateway выставляет session cookie без `maxAge`/`expires`. Срок жизни сессии и token lifecycle принадлежат `identity.service`.

Запуск:

```bash
yarn start:admin_gw.dev
```

Production-like старт после сборки:

```bash
yarn build:admin_gw
yarn start
```

## Проверки

Минимальная проверка перед commit:

```bash
yarn build:admin_gw
```

GitHub Actions запускает:

```bash
yarn install --immutable
yarn build:admin_gw
```

После изменений в product/store/shop разделении дополнительно проверять ручной
E2E через admin UI: редактирование товара/варианта, создание или редактирование
store product, отображение цены и валюты.

## Ветка Cart API

`code/src/api/cart_srv/v1` повторяет структуру сервисных веток gateway: `ApiCartV1Module`,
RMQ client в `shared`, модуль `cart` с `presentation`, `application` и `domain`.
Ответы преобразуются и проверяются через Entity. Сервису передается только его
административный контракт; HTTP доступ защищен общим SessionAuthGuard.
Очередь задается обязательным `AMQP_CART_SRV_COMMAND_QUEUE`.

| HTTP | Команда Cart |
|---|---|
| GET `/v1/carts` | `cart.admin.getAll` |
| GET `/v1/carts/:uuid` | `cart.admin.getByUuid` |
| POST `/v1/carts/:uuid/items` | `cart.admin.item.add` |
| PATCH `/v1/carts/:uuid/items/:recordUuid` | `cart.admin.item.setQuantity` |
| DELETE `/v1/carts/:uuid/items/:recordUuid` | `cart.admin.item.remove` |

Список принимает необязательные `shopUuid`, `ownerUuid`, `status=active|closed`,
`limit` (1–100, по умолчанию 50), `offset` (от 0, по умолчанию 0). Без status
показываются активные и закрытые корзины. Ответ `{ data, meta: { totalRows, limit, offset } }`;
строка содержит UUID корзины/владельца, магазин с названием, версию, itemsCount
(число позиций), createdAt/updatedAt/closedAt. Сортировка: updatedAt DESC, uuid ASC.
Карточка содержит полный состав с названиями, ценами, остатком и причинами
недоступности. Просмотр не создает пустую корзину; неизвестный UUID дает 404.
Закрытая корзина доступна для просмотра, изменения запрещены.

POST body: `{ recordUuid, quantity }` — прибавляет количество.
PATCH body: `{ quantity, version }` — устанавливает количество.
DELETE body: `{ version }`. Количество — положительное целое;
version — версия целевой позиции из `items[].version`, положительная
десятичная строка без потери bigint precision. Ключ внутренней команды Cart
`idempotencyKey` создает gateway один раз перед RMQ-вызовом. HTTP-клиент его
не передает; новый HTTP-запрос является новой операцией. Ключ защищает повторы
внутренней команды, а не повторные независимые HTTP-запросы.
Ответ изменения содержит cartUuid,
recordUuid, cartVersion; add/set также quantity.

Cart определяет ownerUuid/shopUuid по UUID корзины из path и повторно проверяет
целевую корзину внутри транзакции. Здесь нет подстановки текущего администратора
как покупателя. Сохраняются проверки остатков, принадлежности магазину, версий и
checkout locks; изменять закрытую корзину либо создавать новую через эти команды
нельзя. Изменение и Cart outbox атомарны. UI и доставка Cart events через Socket
Gateway остаются отдельной интеграцией. HTTP не открывает checkout/owner.close.

Проверки: `yarn build:admin_gw` и
`yarn test --runInBand --runTestsByPath src/api/cart_srv/v1/cart/presentation/cart.http.spec.ts`.

## Dev infrastructure

В этом repo намеренно нет:

- `docker-compose.yaml` для MinIO/RabbitMQ/Postgres;
- OS-level install scripts для RabbitMQ;
- GitLab CI.

Общая локальная инфраструктура должна жить на уровне `sellgar.workspace`, а storage-specific инфраструктура MinIO - в `sellgar.file.service` или workspace dev-инфре.

## Документация для агентов

Архитектурные ограничения, текущий аудит и порядок безопасных изменений описаны в `AGENTS.md`.

В публичной карточке нет sourceVersions, shop.sourceVersion и checkoutUuid.
Доступный остаток называется availableQuantity; версия корзины в результате
записи — cartVersion. Внутренние поля Cart адаптируются в gateway.

## CI и доставка

Push в `development` запускает build → publish → test → deploy.
`test` — отдельная job с unit/компонентными тестами из Docker target `tests`.
Если тесты не прошли, deploy не запускается.
Сборка, тесты и публикация выполняются на GitHub-hosted runners;
deploy — на repository-scoped runner в dev VM.
Обычная раскатка выполняется Helm с ожиданием готовности и проверкой image digest.
Argo CD продолжает управлять платформой, но не этим приложением.

Docker targets: `application`, `tests`.
Миграционного образа и миграционной job у этого приложения нет.

Настройки среды хранятся в `helm/dev/values.yaml`, Secret refs — в
`helm/values.app.yaml`. Версионный immutable ConfigMap монтируется через
`environmentFile`; значения credentials не передаются в GitHub-hosted jobs или Git.
Внутренний HTTP-порт — 8080, в dev одна реплика.

PR запускает build/test без публикации и деплоя. Push в `release/*` публикует
кандидат с `release.json`; ручной production workflow из `master` принимает
`candidate-<run-number>.<attempt>`, проверяет успешный исходный CI и идентичность
дерева, продвигает те же digest без пересборки. Production ещё не подготовлен:
нужны его values, Secrets, runner и GitHub environment protections.
Откат миграций в эту схему не включён.

Общие workflows закреплены тегом `delivery-v0.6.0` в `sellgar.infrastructure`.
Порядок установки runner и передачи управления: [доставка приложений](https://github.com/pyatakovvg/sellgar.infrastructure/blob/development/docs/application-delivery.md).
