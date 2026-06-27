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
- `sellgar.product.service` - product/catalog/store/price/property/category контракты;
- `sellgar.file.service` - file/folder HTTP API и upload/download flows;
- RabbitMQ - transport для команд и событий identity/product;
- MinIO - не прямая зависимость gateway, используется через `file.service`.

## Текущая структура

Репозиторий пока сохранил структуру, вынесенную из бывшего `sellgar.server`:

```text
.
├── package.json
├── gateways/
│   └── admin/
│       ├── package.json
│       ├── .env.example
│       └── src/
└── AGENTS.md
```

Это временная mini-monorepo структура. Если в этом repo не появятся несколько локальных packages, целевое состояние - схлопнуть `gateways/admin` в корень репозитория.

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
cp gateways/admin/.env.example gateways/admin/.env
```

Проверить, что в `.env` есть адреса RabbitMQ и downstream services. Приложение валидирует обязательные env keys при старте и завершится с явной ошибкой, если ключ отсутствует или числовой ключ задан не числом.

Запуск:

```bash
yarn dev:admin_gw
```

Production-like старт после сборки:

```bash
yarn build:admin_gw
yarn start:admin_gw
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

## Dev infrastructure

В этом repo намеренно нет:

- `docker-compose.yaml` для MinIO/RabbitMQ/Postgres;
- OS-level install scripts для RabbitMQ;
- GitLab CI.

Общая локальная инфраструктура должна жить на уровне `sellgar.workspace`, а storage-specific инфраструктура MinIO - в `sellgar.file.service` или workspace dev-инфре.

## Документация для агентов

Архитектурные ограничения, текущий аудит и порядок безопасных изменений описаны в `AGENTS.md`.
