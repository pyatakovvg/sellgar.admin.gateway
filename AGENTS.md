# @gateway/admin

`gateways/admin` - административный gateway. Он обслуживает admin-клиент,
подключает identity/product/file API и содержит admin-only HTTP-инфраструктуру:
cookie/session auth, CORS, guards и общий exception filter.

## Что здесь находится

- `src/main.ts` - HTTP bootstrap, CORS из `ORIGINS`, global validation pipe, exception filter и RMQ event microservice.
- `src/app.module.ts` - композиция admin API, auth/session/token модулей, product v2 API и общих сервисов.
- `src/api/identity_srv` - admin adapter к `services/identity_srv`; внутри
  `api/*` лежат внешние контракты, а `helpers/session-auth` содержит
  gateway-side session auth обвязку.
- `src/api/product_srv/v2` - admin-контракты управления каталогом и магазинами.
- `src/api/file_srv/v1` - admin-доступ к файловому сервису.
- `src/common` - только общая инфраструктура gateway, сейчас exception filter.

## Правила изменений

- Сохраняйте admin-специфичную HTTP/session обвязку в gateway-слое, но не
  переносите сюда владение сущностями identity/product.
- При изменении auth/session/token сверяйте одноименные сервисы в `services/identity_srv`.
- При изменении product/file endpoint сверяйте сервис-владелец и DTO на стороне `services/product_srv` или `services/file_srv`.
- Для preview/download файлов в admin UI используйте защищенный `GET /v1/files/:uuid`.
  Не делайте этот endpoint публичным ради картинок и не добавляйте `deviceId`
  или другие auth-данные в query string.
- Изображения товара в admin API относятся к варианту товара:
  `POST /v2/variants/:uuid/images` и
  `DELETE /v2/variants/:uuid/images/:imageUuid`.
- Не превращайте `src/common` или `helpers` в свалку feature-specific файлов:
  helper должен иметь понятного владельца и короткую структуру.
- Не меняйте RMQ queues/exchange без проверки `.env` контракта и потребителей событий.

## Проверка

Основная проверка: `yarn workspace @gateway/admin run build`.

Для auth/session unit-тестов: `yarn workspace @gateway/admin test --runInBand`.
