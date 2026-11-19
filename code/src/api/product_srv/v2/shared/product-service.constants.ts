export const PRODUCT_COMMAND_SERVICE = 'PRODUCT_COMMAND_SERVICE';

export const ProductServiceCommand = {
  unit: {
    getAll: 'catalog.v2.unit.getAll',
    getByCode: 'catalog.v2.unit.getByCode',
    create: 'catalog.v2.unit.create',
    update: 'catalog.v2.unit.update',
  },
  brand: {
    getAll: 'catalog.v2.brand.getAll',
    getByCode: 'catalog.v2.brand.getByCode',
    create: 'catalog.v2.brand.create',
    update: 'catalog.v2.brand.update',
  },
  property: {
    getAll: 'catalog.v2.property.getAll',
    getByCode: 'catalog.v2.property.getByCode',
    create: 'catalog.v2.property.create',
    update: 'catalog.v2.property.update',
    createOption: 'catalog.v2.property.option.create',
    updateOption: 'catalog.v2.property.option.update',
  },
  productType: {
    getAll: 'catalog.v2.productType.getAll',
    getByUuid: 'catalog.v2.productType.getByUuid',
    create: 'catalog.v2.productType.create',
    update: 'catalog.v2.productType.update',
  },
  product: {
    getAll: 'catalog.v2.product.getAll',
    getByUuid: 'catalog.v2.product.getByUuid',
    create: 'catalog.v2.product.create',
    update: 'catalog.v2.product.update',
    archive: 'catalog.v2.product.archive',
    restore: 'catalog.v2.product.restore',
    createVariant: 'catalog.v2.product.variant.create',
    updateVariant: 'catalog.v2.product.variant.update',
    archiveVariant: 'catalog.v2.product.variant.archive',
    restoreVariant: 'catalog.v2.product.variant.restore',
  },
} as const;
