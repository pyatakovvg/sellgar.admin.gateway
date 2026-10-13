# @gateway/admin

`gateways/admin` - административный gateway. Он обслуживает admin-клиент,
подключает identity/product/file API и содержит admin-only HTTP-инфраструктуру:
cookie/session auth, CORS, guards и общий exception filter.

## Что здесь находится

- `src/main.ts` - HTTP bootstrap, CORS из `ORIGINS`, global validation pipe,
  exception filter и RMQ consumers identity/realtime events.
- `src/app.module.ts` - композиция admin API, auth/session/token модулей, product v2 API и общих сервисов.
- `src/api/identity_srv` - admin adapter к `services/identity_srv`; внутри
  `api/*` лежат внешние контракты, а `helpers/session-auth` содержит
  gateway-side session auth обвязку.
- `src/api/product_srv/v2` - admin-контракты управления каталогом.
- `src/api/shop_srv/v1` - admin HTTP-контракт магазинов; сейчас сохраняет публичный route `/v2/shops`, но ходит в `SHOP_COMMAND_SERVICE`.
- `src/api/store_srv/v1` - admin HTTP-контракты продаваемых товаров, цен,
  валют и складских данных; не смешивать с `product_srv/v2`.
- `src/api/realtime` - преобразование доменных events в единый
  `realtime.delivery.requested.v1`; payload собирается через тот же admin
  read-model composer, что использует HTTP.
- `src/api/file_srv/v1` - admin-доступ к файловому сервису.
- `src/common` - только общая инфраструктура gateway, сейчас exception filter.

## Правила изменений

- Сохраняйте admin-специфичную HTTP/session обвязку в gateway-слое, но не
  переносите сюда владение сущностями identity/product.
- При изменении auth/session/token сверяйте одноименные сервисы в `services/identity_srv`.
- При изменении product/file endpoint сверяйте сервис-владелец и DTO на стороне `services/product_srv` или `services/file_srv`.
- В ответе Product service имя изображения бренда находится в `images[].image.fileName`; admin Entity преобразует его в публичное `images[].fileName`.
- `/v2/shops` является HTTP-контрактом admin gateway, но сервис-владелец домена shop - `services/shop_srv`.
- Store routes должны ходить в `store_srv`, а catalog routes - в `product_srv`.
  Не возвращайте store/price/currency через product adapter после разделения
  сервисов.
- Для preview/download файлов в admin UI используйте защищенный `GET /v1/files/:uuid`.
  Не делайте этот endpoint публичным ради картинок и не добавляйте `deviceId`
  или другие auth-данные в query string.
- Изображения товара в admin API относятся к варианту товара:
  `POST /v2/variants/:uuid/images` и
  `DELETE /v2/variants/:uuid/images/:imageUuid`.
- Не превращайте `src/common` или `helpers` в свалку feature-specific файлов:
  helper должен иметь понятного владельца и короткую структуру.
- Не меняйте RMQ queues/exchange без проверки `.env` контракта и потребителей событий.
- Не публикуйте domain events напрямую в Socket Gateway. Admin Gateway сохраняет
  исходный `eventUuid`, нормализует payload в admin-facing Entity и публикует
  только transport-neutral delivery request.

## Проверка

Основная проверка: `yarn workspace @gateway/admin run build`.

Для auth/session unit-тестов: `yarn workspace @gateway/admin test --runInBand`.

## Учетные записи Store

Store API возвращает offers[].records[]: uuid, article, clarifications[]
(position/value) и inventory (recordUuid, quantity, reserved, available, version).
Артикул и остаток принадлежат учетной записи. У товара/связи варианта их нет.
Каталог — product_srv_v2; нельзя обращаться к прежнему product API или
возвращать старый offer_inventory контракт.

Команды учета HTTP: POST /v2/store/products/records/:recordUuid/inventory/
receipt, write-off, adjust. expectedVersion — версия record_inventory.
PATCH /v2/store/products/:uuid изменяет метаданные/записи, но не остатки.
POST /v2/store/products/catalog/:productUuid/synchronize делает один запрос
актуального снимка каталога, без опросов.
