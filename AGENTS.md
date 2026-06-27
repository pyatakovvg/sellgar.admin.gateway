# sellgar.admin.gateway

Этот файл - рабочая инструкция для агентов, которые меняют или аудируют `sellgar.admin.gateway`.
Обновляй его, когда в пакете появляются новые правила, runtime-контракты, известные проблемы или решения по структуре.

## Назначение пакета

`sellgar.admin.gateway` - backend gateway для admin UI. Он является транспортным edge/BFF слоем между админским frontend и внутренними сервисами:

- `identity.service` - auth/session/user/profile/role/token контракты.
- `product.service` - product/catalog/store/price/property/category и связанные команды.
- `file.service` - file/folder HTTP API и upload/download flows.

Gateway не должен становиться владельцем доменной логики сервисов. Его зона ответственности:

- принять HTTP-запрос от admin UI;
- проверить/обновить auth transport state;
- преобразовать request/response DTO под публичный admin API;
- вызвать downstream service через RMQ или HTTP;
- вернуть единый HTTP response frontend-у.

## Текущая структура

```text
.
├── package.json
├── yarn.lock
├── gateways/
│   └── admin/
│       ├── package.json
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── api/
│       │   │   ├── identity_srv/
│       │   │   ├── product_srv/
│       │   │   └── file_srv/
│       │   └── common/
│       └── tsconfig.json
└── AGENTS.md
```

Сейчас структура унаследована из бывшего `sellgar.server` и не является финальной. При реорганизации сохраняй поведение и меняй структуру небольшими шагами.

Предпочтительная целевая модель:

```text
gateways/admin/src/
  bootstrap/       # запуск приложения, HTTP/RMQ bootstrap, global pipes/filters
  config/          # env schema, typed config helpers
  common/          # общие guards, decorators, filters, cookie/agent/fingerprint helpers
  modules/         # публичные admin API модули
    identity/
    product/
    file/
  clients/         # адаптеры к downstream services
    identity/
    product/
    file/
```

`modules/*` должны описывать admin-facing HTTP API. `clients/*` должны инкапсулировать RMQ/HTTP вызовы во внутренние сервисы.

## Команды

Запускать из корня этого репозитория:

```bash
yarn install
yarn build:admin_gw
yarn dev:admin_gw
yarn start:admin_gw
```

Текущая проверка сборки:

```bash
yarn build:admin_gw
```

На момент аудита сборка проходит.

## Git и install-артефакты

Репозиторий использует Yarn 3.6.1 с `nodeLinker: node-modules`.

Tracked:

- `.yarn/releases`
- `.yarn/plugins`
- `yarn.lock`

Ignored/local:

- `node_modules/`
- `.yarn/cache/`
- `.yarn/install-state.gz`
- `gateways/admin/dist/`

Не коммить `node_modules`, `.yarn/cache`, `.yarn/install-state.gz` без отдельного решения по zero-install стратегии.

## Runtime-контракты

### Config

`ConfigModule.forRoot()` подключается в `gateways/admin/src/app.module.ts`.

Важное ограничение текущего кода: `gateways/admin/src/main.ts` вручную создает `new ConfigService()` до DI container. Это риск для чтения `.env`. При правках bootstrap лучше получать `ConfigService` через `app.get(ConfigService)` после `NestFactory.create(AppModule)`.

### Identity/session

`identity.service` владеет валидностью сессии и token/session lifecycle.

Gateway должен владеть только transport cookie:

- имя cookie;
- `httpOnly`;
- `sameSite`;
- `secure` в зависимости от окружения;
- сериализация/удаление cookie.

Не переноси session lifetime в gateway без отдельного решения. Текущий `AUTH_COOKIE_EXTEND` и `maxAge` в gateway требуют пересмотра.

### Downstream services

Текущие способы связи:

- `identity.service` - RMQ command queue через `IDENTITY_SERVICE`.
- `product.service` - RMQ command queue через `PRODUCT_COMMAND_SERVICE`.
- `file.service` - HTTP через `API_FILE_SRV`.

Если добавляешь новый вызов к сервису, сначала выбери слой клиента (`clients/*` в целевой модели), а не размазывай `ClientProxy`/`HttpService` по controller/service файлам.

## Архитектурный аудит

Этот аудит рассматривает репозиторий как самостоятельный продуктовый пакет, а не как папку, механически вынутую из старого `sellgar.server`.

### P0 - убрать ложные сигналы о владении и CI

1. `.gitlab-ci.yml` сейчас вреден.

   Файл описывает GitLab pipeline для `services/company_srv/**/*`, которого в этом репозитории нет. Репозиторий живет в GitHub, поэтому файл не просто бесполезен: он создает ложное ожидание, что CI уже есть и что пакет связан с `company_srv`.

   Решение: удалить `.gitlab-ci.yml`. Если нужен CI, добавить `.github/workflows/ci.yml` с реальными командами:

   ```bash
   yarn install --immutable
   yarn build:admin_gw
   ```

   После схлопывания структуры в корень команда должна стать обычной:

   ```bash
   yarn build
   ```

2. `docker-compose.yaml` не должен оставаться в текущем виде.

   В нем закомментированы RabbitMQ/Postgres, а реально активен только `monorepo_minio`. MinIO не является зависимостью admin gateway напрямую: gateway ходит в `file.service` по HTTP, а уже `file.service` владеет MinIO, object keys, metadata и lifecycle.

   Решение: удалить из admin gateway или вынести в workspace-level dev infra. Если нужен compose именно для gateway, он должен описывать только зависимости, нужные для локального запуска gateway, и не называться `monorepo_*`.

3. `docker-compose-minio.yaml` дублирует MinIO и тоже не принадлежит admin gateway.

   MinIO compose должен жить в `sellgar.file.service` или в общей dev-инфре workspace. Два MinIO compose файла с разными credentials (`admin/admin` и `minioadmin/minioadmin`) будут создавать расхождение окружений.

   Решение: удалить из этого репозитория после переноса нужной dev-инфры в правильное место.

4. `rabbit.sh` не должен быть частью пакета.

   Это OS-level install script: `sudo`, apt repositories, systemctl, включение plugin. Такой скрипт не является ни build dependency, ни runtime contract admin gateway. Если RabbitMQ уже запускается локально или через Docker, этот файл опасен тем, что следующий разработчик может начать чинить пакет через изменение ОС.

   Решение: удалить. Документировать RabbitMQ как внешнюю dev dependency в README/workspace docs. Для воспроизводимой локальной среды использовать compose на уровне workspace, а не shell install script внутри gateway.

### P0 - зафиксировать runtime config contract

1. `gateways/admin/src/main.ts` создает `new ConfigService()` до Nest DI container. При этом `ConfigModule.forRoot({ envFilePath: './.env' })` подключен внутри `AppModule`. Это делает чтение `.env` в bootstrap неочевидным и зависит от текущей рабочей директории запуска.

   Решение: после `NestFactory.create(AppModule)` получать config через `app.get(ConfigService)`. Параллельно добавить env validation, чтобы приложение падало на старте с понятной ошибкой, а не стартовало с `undefined` queue/exchange.

2. `main.ts` читает `AMQP_ADMIN_SRV_EVENT_QUEUE` и `AMQP_EVENTS_EXCHANGE`, но `gateways/admin/.env.example` содержит другие ключи:

   - `AMQP_ADMIN_GATEWAY_PRODUCT_SRV_EVENT_QUEUE`
   - `AMQP_ADMIN_GATEWAY_IDENTITY_SRV_EVENT_QUEUE`
   - `AMQP_PRODUCT_SRV_EXCHANGE`
   - `AMQP_IDENTITY_SRV_EXCHANGE`

   Решение: выбрать одну модель событий. Если gateway слушает только product events, bootstrap должен читать product event queue/exchange. Если gateway слушает общий events exchange, `.env.example` должен явно описывать общий queue/exchange.

3. `API_FILE_SRV` используется в file gateway, но отсутствует в `.env.example`.

   Решение: добавить в env contract. Без этого новый разработчик не сможет поднять file flow из документации.

4. `ORIGINS` читается как обязательная строка и сразу вызывает `.split(';')`. При пустом env приложение упадет невалидной JS ошибкой.

   Решение: env validation + typed config helper.

### P0 - закрыть security debt в auth/session

1. `JwtAuthGuard` логирует cookie, refresh token, access token result и session payload. Это production blocker.

   Решение: удалить sensitive logs. Если нужны диагностики, логировать только request id, session id hash/short id и тип ошибки.

2. Gateway сейчас ставит cookie с `maxAge: AUTH_COOKIE_EXTEND`. По принятому контракту `identity.service` владеет валидностью сессии и TTL; gateway владеет только cookie transport.

   Решение: отдельно принять cookie policy. Предпочтительный контракт: gateway выставляет session cookie (`httpOnly`, `sameSite`, `secure` по окружению), а `identity.service` решает active/expired/revoked/renew.

3. `secure: true` сейчас жестко включен в auth middleware/controller/guard. В локальном HTTP окружении это может ломать cookie flow.

   Решение: вынести cookie options в typed config и различать local/prod.

### P1 - решить судьбу монорепы внутри отдельного repo

Сейчас `sellgar.admin.gateway` является отдельным GitHub repo, но внутри него сохранена мини-монорепа:

```text
package.json          # name=root, workspaces=["gateways/**/*"]
gateways/admin/       # единственный реальный package @gateway/admin
```

Для текущей цели это скорее минус, чем плюс:

- workspace-level `sellgar.workspace` уже является точкой сборки нескольких repos через git submodules;
- внутри `sellgar.admin.gateway` нет второго package, ради которого нужен Yarn workspace;
- root package называется `root`, а реальные команды проксируются через `build:admin_gw`;
- CI, README, onboarding и IDE получают лишний уровень вложенности;
- будущие переносы из `sellgar.server` будут каждый раз наследовать старую папочную модель вместо продуктовой модели repo.

Рекомендация: схлопнуть `gateways/admin` в корень репозитория.

Целевое состояние:

```text
.
├── package.json        # name=@gateway/admin
├── src/
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
├── README.md
└── AGENTS.md
```

Оставлять монорепу внутри `sellgar.admin.gateway` имеет смысл только если есть близкий план держать здесь несколько локальных packages, например:

- несколько admin gateway приложений;
- локальные shared libraries только для gateway зоны;
- contract package, который реально используется несколькими packages внутри этого же repo.

Пока такого плана нет, монорепа не помогает развитию. Она маскирует реальный package boundary и размазывает ответственность между workspace repo и service repo.

### P1 - привести ownership зависимостей к реальному коду

Кандидаты на удаление после отдельного commit и проверки `yarn build:admin_gw`:

- `pg` - gateway не должен ходить в Postgres напрямую;
- `sharp` и `@types/sharp` - image processing должен принадлежать `file.service`, не gateway;
- `moment` - в `src` не используется;
- `rand-token` - в `src` не используется;
- `source-map-support` - не используется в runtime scripts;
- `@types/amqplib` - если прямого `amqplib` API нет;
- `supertest` и `@types/supertest` - оставить только если будут реальные e2e tests;
- `passport-local` - не видно рабочей local strategy;
- `passport`, `passport-jwt`, `@nestjs/passport`, `@types/passport-jwt` - пересмотреть после решения по `JwtAuthGuard`.

Нельзя удалять `@nestjs/axios`/`axios`, пока file gateway ходит в `file.service` по HTTP.

`@nestjs/jwt` используется только через `CookiesService.verifyToken()`. Если этот метод не нужен, удалить и `JwtModule`, и `CookiesService.verifyToken()`.

### P1 - убрать мертвые flows

`api/identity_srv/sign-up` сейчас выглядит как недособранный слой:

- module и gateway в основном закомментированы;
- passport strategies лежат рядом, но не подключены как рабочий flow;
- текущий `JwtAuthGuard` не использует passport strategy как точку принятия решения.

Решение: либо удалить sign-up слой из gateway, либо восстановить как полноценный публичный admin flow. Оставлять закомментированный слой нельзя: он искажает картину auth architecture.

### P1 - README как runtime contract

`README.md` пустой. Для отдельного repo это blocker для развития.

Минимальный README должен отвечать:

- что делает admin gateway;
- какие downstream services нужны: identity, product, file;
- какие transport protocols используются: HTTP от UI, RMQ к identity/product, HTTP к file;
- какие env keys обязательны;
- как запустить локально;
- какие команды CI должны выполнять;
- где живет общая workspace dev infra.

### P2 - структура кода после стабилизации

После удаления мусора и фикса config/auth стоит переносить код к модели:

```text
src/
  bootstrap/
  config/
  common/
  modules/
    identity/
    product/
    file/
  clients/
    identity/
    product/
    file/
```

Правило: `modules/*` описывают публичный admin HTTP API, `clients/*` инкапсулируют RMQ/HTTP вызовы к downstream services. Не размазывать `ClientProxy` и `HttpService` по controller/service слоям.

## Рекомендуемый порядок работ

1. Удалить/перенести чужую инфраструктуру:
   - `.gitlab-ci.yml`;
   - `docker-compose.yaml`;
   - `docker-compose-minio.yaml`;
   - `rabbit.sh`.

2. Написать нормальный `README.md` и зафиксировать, где теперь лежит dev infra.

3. Исправить config/bootstrap:
   - `app.get(ConfigService)` вместо `new ConfigService()`;
   - env validation;
   - синхронизировать `.env.example` с реально читаемыми keys.

4. Убрать sensitive logs и принять cookie/session policy.

5. Схлопнуть mini-monorepo в корень repo, если не принято явное решение оставить несколько packages.

6. Удалять зависимости маленькими коммитами:
   - сначала dead sign-up/passport;
   - затем unused runtime deps;
   - после каждого шага запускать `yarn build:admin_gw` или, после схлопывания, `yarn build`.

7. Добавить GitHub Actions CI вместо GitLab CI.

8. Только после этого переносить source structure к `modules/*` и `clients/*`.

## Правила для следующих агентов

- Не смешивай аудит и большие структурные переносы в одном коммите.
- Не меняй auth/session поведение без явного решения, потому что это security-sensitive зона.
- Не добавляй domain ownership в gateway: домен остается в сервисах.
- Если меняешь env key, обнови `.env.example`, README и место чтения config.
- Если меняешь зависимости, проверяй `yarn build:admin_gw` и коммить `yarn.lock`.
- Если находишь новое постоянное правило или проблему, дополни этот файл.
