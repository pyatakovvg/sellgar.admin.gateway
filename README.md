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
- `sellgar.file.service` - file/folder HTTP API и upload/download flows;
- RabbitMQ - transport для команд и событий identity/product;
- MinIO - не прямая зависимость gateway, используется через `file.service`.

## Текущая структура

Репозиторий схлопнут в одиночный package:

```text
.
├── package.json
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── api/
│   ├── common/
│   └── config/
└── AGENTS.md
```

## Установка

Из корня репозитория:

```bash
yarn install
```

Репозиторий использует Yarn 3.6.1 и `nodeLinker: node-modules`.

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
yarn start:dev
```

Production-like старт после сборки:

```bash
yarn build
yarn start
```

## Проверки

Минимальная проверка перед commit:

```bash
yarn build
```

GitHub Actions запускает:

```bash
yarn install --immutable
yarn build
```

После изменений в product/store/shop разделении дополнительно проверять ручной
E2E через admin UI: редактирование товара/варианта, создание или редактирование
store product, отображение цены и валюты.

## Dev infrastructure

В этом repo намеренно нет:

- `docker-compose.yaml` для MinIO/RabbitMQ/Postgres;
- OS-level install scripts для RabbitMQ;
- GitLab CI.

Общая локальная инфраструктура должна жить на уровне `sellgar.workspace`, а storage-specific инфраструктура MinIO - в `sellgar.file.service` или workspace dev-инфре.

## Документация для агентов

Архитектурные ограничения, текущий аудит и порядок безопасных изменений описаны в `AGENTS.md`.
