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

## Найдено аудитом

### Критично

1. `main.ts` использует env keys, которых нет в `.env.example`:
   - `AMQP_ADMIN_SRV_EVENT_QUEUE`
   - `AMQP_EVENTS_EXCHANGE`

   В `.env.example` сейчас есть:
   - `AMQP_ADMIN_GATEWAY_PRODUCT_SRV_EVENT_QUEUE`
   - `AMQP_ADMIN_GATEWAY_IDENTITY_SRV_EVENT_QUEUE`
   - `AMQP_PRODUCT_SRV_EXCHANGE`
   - `AMQP_IDENTITY_SRV_EXCHANGE`

   Нужно привести event queue/exchange config к одной модели. До этого event microservice может стартовать с `undefined` queue/exchange.

2. В `JwtAuthGuard` логируются cookie, refresh token, access token result и session payload. Это нельзя оставлять в production/runtime logs.

3. `API_FILE_SRV` используется в file gateway, но отсутствует в `.env.example`.

4. `test:e2e` указывает на `env.d.ts/jest-e2e.json`, но e2e config/test files в пакете не обнаружены.

### Нужно пересмотреть

1. `JwtAuthGuard extends AuthGuard('jwt')`, но сам полностью переопределяет `canActivate()` и вручную ходит в `identity.service`. Passport strategy фактически не является рабочей точкой входа.

2. `PassportModule`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local` выглядят кандидатами на удаление после отдельной проверки сборки и runtime auth flow.

3. `@nestjs/jwt` и `JwtService` используются только в `CookiesService.verifyToken()`, но этот метод не вызывается. Если метод не нужен, `@nestjs/jwt` тоже может стать лишним.

4. `pg`, `sharp`, `moment`, `rand-token` в `@gateway/admin` выглядят неиспользуемыми в `src`.

5. `sign-up` module/strategies сейчас в основном закомментированы или не подключены. Нужно либо удалить мертвый слой, либо вернуть как полноценный рабочий flow.

6. `.gitlab-ci.yml` не адаптирован под пакет: там остались `services/company_srv` и `deploy_service1`.

7. `README.md` пустой. Нужен минимальный README с назначением, env, командами и downstream dependencies.

8. `docker-compose.yaml` и `docker-compose-minio.yaml` выглядят как остаток общей dev-инфры. MinIO скорее относится к `file.service` или workspace dev-инфре, а не к admin gateway.

9. В коде есть временные `console.log`/`console.info`. Для production-кода использовать `Logger` и не логировать секреты/token/cookie/session payload.

## Рекомендуемый порядок работ

1. Исправить config/bootstrap:
   - получать `ConfigService` через DI;
   - добавить env validation;
   - синхронизировать `.env.example` с реальными ключами.

2. Убрать sensitive logs из auth/session flow.

3. Согласовать cookie policy:
   - session cookie или maxAge;
   - `secure` для local/prod;
   - `sameSite`;
   - кто владеет TTL.

4. Почистить package dependencies:
   - сначала удалить явно мертвый `sign-up/passport` слой или вернуть его;
   - затем удалить неиспользуемые пакеты;
   - после каждого шага запускать `yarn build:admin_gw`.

5. Обновить `.gitlab-ci.yml` и `README.md`.

6. Только после стабилизации runtime-контракта переносить структуру к `modules/*` и `clients/*`.

## Правила для следующих агентов

- Не смешивай аудит и большие структурные переносы в одном коммите.
- Не меняй auth/session поведение без явного решения, потому что это security-sensitive зона.
- Не добавляй domain ownership в gateway: домен остается в сервисах.
- Если меняешь env key, обнови `.env.example`, README и место чтения config.
- Если меняешь зависимости, проверяй `yarn build:admin_gw` и коммить `yarn.lock`.
- Если находишь новое постоянное правило или проблему, дополни этот файл.
