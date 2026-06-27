# admin identity_srv adapter

Этот каталог содержит admin gateway adapter для `services/identity_srv`.

## Структура

- `identity-srv.module.ts` - подключение identity API modules и RMQ client.
- `api/*` - внешний HTTP/RMQ adapter contract по доменным срезам identity:
  `auth`, `session`, `profile`, `user`, `role`, `permission`, `token`,
  `sign-up`.
- `helpers/session-auth` - gateway-side session auth infrastructure:
  decorators, guard, cookie helper и построение session context.

## Границы

- `api/*` описывает внешний admin gateway contract и adapters к
  `services/identity_srv`.
- `helpers/session-auth` не является доменным API. Он обслуживает HTTP/session
  boundary gateway.
- Валидность session credential и TTL принадлежат `services/identity_srv`.
- Gateway может читать/ставить cookie и строить fingerprint, но не решает
  active/expired/revoked самостоятельно.

## Проверка

```bash
yarn workspace @gateway/admin run build
```

Для auth/session изменений также запускать доступные unit-тесты:

```bash
yarn workspace @gateway/admin test --runInBand
```
