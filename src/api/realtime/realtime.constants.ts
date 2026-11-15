export const REALTIME_EVENT_SERVICE = 'REALTIME_EVENT_SERVICE';
export const DELIVERY_REQUESTED_PATTERN = 'realtime.delivery.requested.v1';
export const PRODUCT_UPDATED_PATTERN = 'product.updated';
export const STORE_PRODUCT_UPDATED_PATTERN = 'store.product.updated';

export const REALTIME_CHANNELS = ['products', 'offers', 'categories'] as const;
export type RealtimeChannel = (typeof REALTIME_CHANNELS)[number];

export const CATEGORY_CREATED_PATTERN = 'store.category.created';
export const CATEGORY_UPDATED_PATTERN = 'store.category.updated';
