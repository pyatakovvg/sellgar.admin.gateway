import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { ProductEntity } from '@/api/product_srv/v2/product/product.entity';
import { VariantEntity } from '@/api/product_srv/v2/variant/variant.entity';
import { ShopEntity } from '@/api/shop_srv/v1/shop/shop.entity';

import {
  OfferInventoryEntity as RawOfferInventoryEntity,
  StoreOfferEntity as RawStoreOfferEntity,
  StoreProductEntity as RawStoreProductEntity,
  StoreProductResultEntity as RawStoreProductResultEntity,
} from '../store-product.entity';
import {
  OfferInventoryEntity,
  StoreProductEntity,
  StoreProductResultEntity,
} from '../store-product-view.entity';

interface ComposeContext {
  products: Map<string, ProductEntity>;
  variants: Map<string, VariantEntity>;
  shops: Map<string, ShopEntity>;
}

@Injectable()
export class StoreProductViewComposer {
  constructor(
    @Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy,
    @Inject('SHOP_COMMAND_SERVICE') private readonly shopProxy: ClientProxy,
  ) {}

  async composeResult(result: RawStoreProductResultEntity): Promise<StoreProductResultEntity> {
    const context = this.createContext();
    const data = (
      await Promise.all(result.data.map((item) => this.composeWithContext(item, context)))
    ).filter((item) => item.offers.length > 0);
    const resultInstance = plainToInstance(
      StoreProductResultEntity,
      {
        data,
        meta: {
          ...result.meta,
          totalRows: data.length,
        },
      },
      { excludeExtraneousValues: true },
    );

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  compose(storeProduct: RawStoreProductEntity): Promise<StoreProductEntity> {
    return this.composeWithContext(storeProduct, this.createContext());
  }

  toPlain(storeProduct: StoreProductEntity): Record<string, unknown> {
    return instanceToPlain(storeProduct) as Record<string, unknown>;
  }

  private async composeWithContext(
    storeProduct: RawStoreProductEntity,
    context: ComposeContext,
  ): Promise<StoreProductEntity> {
    const [shop, product] = await Promise.all([
      this.getShop(storeProduct.shopUuid, context),
      this.getProduct(storeProduct.productUuid, context),
    ]);

    const offers = (
      await Promise.all(storeProduct.offers.map((offer) => this.composeOffer(offer, product, context)))
    ).filter((offer) => offer !== null);
    const resultInstance = plainToInstance(
      StoreProductEntity,
      {
        uuid: storeProduct.uuid,
        version: storeProduct.version,
        status: storeProduct.status,
        showing: storeProduct.showing,
        article: storeProduct.article,
        shop: {
          uuid: shop.uuid,
          name: shop.name,
          status: shop.status,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
        product: {
          uuid: product.uuid,
          name: product.name,
          status: product.status,
          brand: this.pickNamedEntity(product.brand),
          category: this.pickNamedEntity(product.category),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
        offers,
        createdAt: storeProduct.createdAt,
        updatedAt: storeProduct.updatedAt,
      },
      { excludeExtraneousValues: true },
    );

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  private async composeOffer(offer: RawStoreOfferEntity, product: ProductEntity, context: ComposeContext) {
    const variant =
      product.variants?.find((item) => item.uuid === offer.variantUuid) ??
      (await this.getVariant(offer.variantUuid, context));

    if (!variant) {
      return null;
    }

    return {
      uuid: offer.uuid,
      version: offer.version,
      status: offer.status,
      showing: offer.showing,
      article: offer.article,
      variant: {
        uuid: variant.uuid,
        name: variant.name,
        status: variant.status,
        properties: variant.properties ?? [],
        images: variant.images ?? [],
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      },
      prices: offer.prices ?? [],
      currentPrice: offer.currentPrice ?? null,
      inventory: offer.inventory ? this.composeInventoryPlain(offer.inventory) : null,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }

  async composeInventory(inventory: RawOfferInventoryEntity): Promise<OfferInventoryEntity> {
    const resultInstance = plainToInstance(OfferInventoryEntity, this.composeInventoryPlain(inventory), {
      excludeExtraneousValues: true,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  private composeInventoryPlain(inventory: RawOfferInventoryEntity) {
    return {
      uuid: inventory.uuid,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      available: inventory.quantity - inventory.reserved,
      version: inventory.version,
      updatedAt: inventory.updatedAt,
    };
  }

  private createContext(): ComposeContext {
    return {
      products: new Map(),
      variants: new Map(),
      shops: new Map(),
    };
  }

  private async getProduct(uuid: string, context: ComposeContext): Promise<ProductEntity> {
    const cached = context.products.get(uuid);

    if (cached) {
      return cached;
    }

    const result = await firstValueFrom(this.productProxy.send({ cmd: 'product.getByUuid' }, { uuid }));
    const resultInstance = plainToInstance(ProductEntity, result);

    await validateOrReject(resultInstance);
    context.products.set(uuid, resultInstance);

    return resultInstance;
  }

  private async getVariant(uuid: string, context: ComposeContext): Promise<VariantEntity | null> {
    const cached = context.variants.get(uuid);

    if (cached) {
      return cached;
    }

    try {
      const result = await firstValueFrom(
        this.productProxy.send({ cmd: 'product.variant.getByUuid' }, { uuid }),
      );
      const resultInstance = plainToInstance(VariantEntity, result);

      await validateOrReject(resultInstance);
      context.variants.set(uuid, resultInstance);

      return resultInstance;
    } catch {
      return null;
    }
  }

  private async getShop(uuid: string, context: ComposeContext): Promise<ShopEntity> {
    const cached = context.shops.get(uuid);

    if (cached) {
      return cached;
    }

    const result = await firstValueFrom(this.shopProxy.send({ cmd: 'shop.getByUuid' }, { uuid }));
    const resultInstance = plainToInstance(ShopEntity, result);

    await validateOrReject(resultInstance);
    context.shops.set(uuid, resultInstance);

    return resultInstance;
  }

  private pickNamedEntity<T extends { uuid: string; name: string; createdAt: string; updatedAt: string }>(
    entity: T,
  ) {
    return {
      uuid: entity.uuid,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
