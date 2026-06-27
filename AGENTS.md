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
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── api/
│   │   ├── identity_srv/
│   │   ├── product_srv/
│   │   └── file_srv/
│   ├── common/
│   └── config/
└── AGENTS.md
```

Структура уже схлопнута из бывшего `gateways/admin` в корень repo. При дальнейшей реорганизации сохраняй поведение и меняй структуру небольшими шагами.

Предпочтительная целевая модель:

```text
src/
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
yarn build
yarn start:dev
yarn start
```

Текущая проверка сборки:

```bash
yarn build
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
- `dist/`

Не коммить `node_modules`, `.yarn/cache`, `.yarn/install-state.gz` без отдельного решения по zero-install стратегии.

## Runtime-контракты

### Config

`ConfigModule.forRoot()` подключается в `src/app.module.ts`.

`src/main.ts` получает `ConfigService` через DI: `app.get(ConfigService)` после `NestFactory.create(AppModule)`.

### Identity/session

`identity.service` владеет валидностью сессии и token/session lifecycle.

Gateway должен владеть только transport cookie:

- имя cookie;
- `httpOnly`;
- `sameSite`;
- `secure` в зависимости от окружения;
- сериализация/удаление cookie.

Не переноси session lifetime в gateway без отдельного решения. Gateway выставляет session cookie без `maxAge`/`expires`; session lifetime остается в `identity.service`.

### Downstream services

Текущие способы связи:

- `identity.service` - RMQ command queue через `IDENTITY_SERVICE`.
- `product.service` - RMQ command queue через `PRODUCT_COMMAND_SERVICE`.
- `file.service` - HTTP через `API_FILE_SRV`.

Если добавляешь новый вызов к сервису, сначала выбери слой клиента (`clients/*` в целевой модели), а не размазывай `ClientProxy`/`HttpService` по controller/service файлам.

## Архитектурный аудит

Этот аудит рассматривает репозиторий как самостоятельный продуктовый пакет, а не как папку, механически вынутую из старого `sellgar.server`.

### P0 - убрать ложные сигналы о владении и CI

Статус: выполнено. Из repo удалены `.gitlab-ci.yml`, `docker-compose.yaml`, `docker-compose-minio.yaml` и `rabbit.sh`. Вместо GitLab CI добавлен GitHub Actions workflow `.github/workflows/ci.yml`.

1. `.gitlab-ci.yml` был вреден.

   Файл описывает GitLab pipeline для `services/company_srv/**/*`, которого в этом репозитории нет. Репозиторий живет в GitHub, поэтому файл не просто бесполезен: он создает ложное ожидание, что CI уже есть и что пакет связан с `company_srv`.

   Решение: удален. CI перенесен в `.github/workflows/ci.yml` с реальными командами:

   ```bash
   yarn install --immutable
   yarn build
   ```

2. `docker-compose.yaml` не должен был оставаться в прежнем виде.

   В нем закомментированы RabbitMQ/Postgres, а реально активен только `monorepo_minio`. MinIO не является зависимостью admin gateway напрямую: gateway ходит в `file.service` по HTTP, а уже `file.service` владеет MinIO, object keys, metadata и lifecycle.

   Решение: удален из admin gateway. Если нужен compose именно для gateway, он должен описывать только зависимости, нужные для локального запуска gateway, и не называться `monorepo_*`.

3. `docker-compose-minio.yaml` дублировал MinIO и тоже не принадлежал admin gateway.

   MinIO compose должен жить в `sellgar.file.service` или в общей dev-инфре workspace. Два MinIO compose файла с разными credentials (`admin/admin` и `minioadmin/minioadmin`) будут создавать расхождение окружений.

   Решение: удален из этого репозитория. Нужную dev-инфру переносить в `sellgar.file.service` или workspace-level dev infra.

4. `rabbit.sh` не должен быть частью пакета.

   Это OS-level install script: `sudo`, apt repositories, systemctl, включение plugin. Такой скрипт не является ни build dependency, ни runtime contract admin gateway. Если RabbitMQ уже запускается локально или через Docker, этот файл опасен тем, что следующий разработчик может начать чинить пакет через изменение ОС.

   Решение: удален. RabbitMQ документируется как внешняя dev dependency в README/workspace docs. Для воспроизводимой локальной среды использовать compose на уровне workspace, а не shell install script внутри gateway.

### P0 - зафиксировать runtime config contract

Статус: выполнено. `main.ts` получает `ConfigService` через DI, `ConfigModule.forRoot()` использует `validateEnv`, `.env.example` дополнен HTTP адресами downstream services, а product event listener использует product event queue/exchange keys.

1. `src/main.ts` больше не создает `new ConfigService()` до Nest DI container.

   Решение: выполнено для DI и validation.

2. `main.ts` больше не читает неописанные `AMQP_ADMIN_SRV_EVENT_QUEUE` и `AMQP_EVENTS_EXCHANGE`. Product event listener использует ключи, описанные в `.env.example`:

   - `AMQP_ADMIN_GATEWAY_PRODUCT_SRV_EVENT_QUEUE`
   - `AMQP_PRODUCT_SRV_EXCHANGE`

   Решение: выполнено для текущего единственного event consumer `product.updated`.

3. `API_FILE_SRV` и `API_PRODUCT_SRV` используются gateway кодом и описаны в `.env.example`.

   Решение: выполнено.

4. `ORIGINS` валидируется как обязательная непустая строка и нормализуется в bootstrap.

   Решение: выполнено через `validateEnv`.

### P0 - закрыть security debt в auth/session

Статус: выполнено. Из активного auth/session flow убраны логи cookie/token/session payload. Cookie options вынесены в `AuthCookieService`; `.env.example` дополнен `AUTH_COOKIE_SECURE` и `AUTH_COOKIE_SAME_SITE`; env validation проверяет эти keys. Gateway выставляет session cookie без `maxAge`/`expires`.

1. `JwtAuthGuard` больше не логирует cookie, refresh token, access token result и session payload.

   Решение: выполнено. Если нужны диагностики, логировать только request id, session id hash/short id и тип ошибки.

2. Gateway больше не ставит cookie с `maxAge`. По принятому контракту `identity.service` владеет валидностью сессии и TTL; gateway владеет только cookie transport.

   Решение: выполнено. `AUTH_COOKIE_EXTEND` удален из env contract, cookie стала session cookie.

3. `secure: true` больше не жестко включен в auth middleware/controller/guard.

   Решение: выполнено через `AUTH_COOKIE_SECURE` и `AuthCookieService`.

### P1 - решить судьбу монорепы внутри отдельного repo

Статус: выполнено. `gateways/admin` схлопнут в корень repo; root package теперь `@gateway/admin`, команды запускаются напрямую через `yarn build`, `yarn start:dev`, `yarn start`.

Решение принято потому что:

- workspace-level `sellgar.workspace` уже является точкой сборки нескольких repos через git submodules;
- внутри `sellgar.admin.gateway` не было второго package, ради которого нужен Yarn workspace;
- root package назывался `root`, а реальные команды проксировались через workspace aliases;
- CI, README, onboarding и IDE получали лишний уровень вложенности.

Возвращать монорепу внутри `sellgar.admin.gateway` имеет смысл только если появится близкий план держать здесь несколько локальных packages, например:

- несколько admin gateway приложений;
- локальные shared libraries только для gateway зоны;
- contract package, который реально используется несколькими packages внутри этого же repo.

### P1 - привести ownership зависимостей к реальному коду

Статус: выполнено для известных кандидатов. Удалены dead `sign-up` слой, Passport integration, `@nestjs/jwt` и неиспользуемые зависимости; `JwtAuthGuard` теперь обычный `CanActivate`, а `CookiesService` только парсит gateway cookie payload.

Удалено после проверки `yarn build`:

- `pg` - gateway не должен ходить в Postgres напрямую;
- `sharp` и `@types/sharp` - image processing должен принадлежать `file.service`, не gateway;
- `moment` - в `src` не используется;
- `rand-token` - в `src` не используется;
- `source-map-support` - не используется в runtime scripts;
- `@types/amqplib` - прямого `amqplib` API нет;
- `supertest` и `@types/supertest` - реальных e2e tests сейчас нет;
- `passport-local`;
- `passport`;
- `passport-jwt`;
- `@nestjs/passport`;
- `@types/passport-jwt`;
- `@nestjs/jwt`;
- `JwtModule`;
- `CookiesService.verifyToken()`.

Нельзя удалять `@nestjs/axios`/`axios`, пока file gateway ходит в `file.service` по HTTP.

### P1 - убрать мертвые flows

Статус: выполнено. `api/identity_srv/sign-up` удален как недособранный слой: module/gateway/service были закомментированы, а passport strategies не были подключены как рабочий flow.

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

1. Удалить/перенести чужую инфраструктуру - выполнено:
   - `.gitlab-ci.yml`;
   - `docker-compose.yaml`;
   - `docker-compose-minio.yaml`;
   - `rabbit.sh`.

2. Написать нормальный `README.md` и зафиксировать, где теперь лежит dev infra - выполнено.

3. Исправить config/bootstrap - выполнено:
   - `app.get(ConfigService)` вместо `new ConfigService()`;
   - env validation;
   - синхронизировать `.env.example` с реально читаемыми keys.

4. Убрать sensitive logs и принять cookie/session policy - выполнено:
   - sensitive auth/session logs убраны;
   - cookie options централизованы;
   - cookie выставляется без gateway-owned `maxAge`/`expires`.

5. Схлопнуть mini-monorepo в корень repo - выполнено.

6. Удалять зависимости маленькими коммитами:
   - сначала dead sign-up/passport - выполнено;
   - затем unused runtime deps - выполнено для найденных кандидатов;
   - после каждого шага запускать `yarn build`.

7. Добавить GitHub Actions CI вместо GitLab CI.

8. Только после этого переносить source structure к `modules/*` и `clients/*`.

## Правила для следующих агентов

- Не смешивай аудит и большие структурные переносы в одном коммите.
- Не меняй auth/session поведение без явного решения, потому что это security-sensitive зона.
- Не добавляй domain ownership в gateway: домен остается в сервисах.
- Если меняешь env key, обнови `.env.example`, README и место чтения config.
- Если меняешь зависимости, проверяй `yarn build` и коммить `yarn.lock`.
- Если находишь новое постоянное правило или проблему, дополни этот файл.
