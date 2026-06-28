import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { ArchiveStoreProductDto } from './dto/archive-store-product.dto';
import { AdjustOfferInventoryDto } from '../gateway/dto/adjust-offer-inventory.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ReceiptOfferInventoryDto } from '../gateway/dto/receipt-offer-inventory.dto';
import { WriteOffOfferInventoryDto } from '../gateway/dto/write-off-offer-inventory.dto';

import { ProductEntity } from '@/api/product_srv/v2/product/product.entity';
import { VariantEntity } from '@/api/product_srv/v2/variant/variant.entity';
import { ShopEntity } from '@/api/shop_srv/v1/shop/shop.entity';

import { StoreProductGateway } from '../gateway/store-product.gateway';
import {
  OfferInventoryEntity as RawOfferInventoryEntity,
  StoreOfferEntity as RawStoreOfferEntity,
  StoreProductEntity as RawStoreProductEntity,
  StoreProductResultEntity as RawStoreProductResultEntity,
} from '../store-product.entity';
import {
  StoreProductEntity,
  StoreProductResultEntity,
  OfferInventoryEntity,
} from '../store-product-view.entity';

interface ComposeContext {
  products: Map<string, ProductEntity>;
  variants: Map<string, VariantEntity>;
  shops: Map<string, ShopEntity>;
}

@Injectable()
export class StoreProductService {
  constructor(
    private readonly storeProductGateway: StoreProductGateway,
    @Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy,
    @Inject('SHOP_COMMAND_SERVICE') private readonly shopProxy: ClientProxy,
  ) {}

  async findAll(query: any) {
    const result = await this.storeProductGateway.findAll(query);

    return this.composeResult(result);
  }

  async findByUuid(uuid: string) {
    const result = await this.storeProductGateway.findByUuid(uuid);

    return this.composeStoreProduct(result, this.createComposeContext());
  }

  async create(dto: CreateStoreProductDto) {
    const result = await this.storeProductGateway.create(dto);

    return this.composeStoreProduct(result, this.createComposeContext());
  }

  async update(dto: UpdateStoreProductDto) {
    const result = await this.storeProductGateway.update(dto);

    return this.composeStoreProduct(result, this.createComposeContext());
  }

  async archive(dto: ArchiveStoreProductDto) {
    const result = await this.storeProductGateway.archive(dto);

    return this.composeStoreProduct(result, this.createComposeContext());
  }

  async receiptInventory(dto: ReceiptOfferInventoryDto) {
    const result = await this.storeProductGateway.receiptInventory(dto);

    return this.composeInventory(result);
  }

  async writeOffInventory(dto: WriteOffOfferInventoryDto) {
    const result = await this.storeProductGateway.writeOffInventory(dto);

    return this.composeInventory(result);
  }

  async adjustInventory(dto: AdjustOfferInventoryDto) {
    const result = await this.storeProductGateway.adjustInventory(dto);

    return this.composeInventory(result);
  }

  private async composeResult(result: RawStoreProductResultEntity) {
    const context = this.createComposeContext();
    const data = (await Promise.all(result.data.map((item) => this.composeStoreProduct(item, context)))).filter(
      (item) => item.offers.length > 0,
    );
    const resultInstance = plainToInstance(StoreProductResultEntity, {
      data,
      meta: {
        ...result.meta,
        totalRows: data.length,
      },
    }, {
      excludeExtraneousValues: true,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  private async composeStoreProduct(storeProduct: RawStoreProductEntity, context: ComposeContext) {
    const [shop, product] = await Promise.all([
      this.getShop(storeProduct.shopUuid, context),
      this.getProduct(storeProduct.productUuid, context),
    ]);

    const offers = (await Promise.all(storeProduct.offers.map((offer) => this.composeOffer(offer, product, context)))).filter(
      (offer) => offer !== null,
    );
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
      {
        excludeExtraneousValues: true,
      },
    );

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  private async composeOffer(offer: RawStoreOfferEntity, product: ProductEntity, context: ComposeContext) {
    const variant = product.variants?.find((item) => item.uuid === offer.variantUuid) ?? (await this.getVariant(offer.variantUuid, context));

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

  private composeInventory(inventory: RawOfferInventoryEntity) {
    const resultInstance = plainToInstance(OfferInventoryEntity, this.composeInventoryPlain(inventory), {
      excludeExtraneousValues: true,
    });

    return validateOrReject(resultInstance).then(() => resultInstance);
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

  private createComposeContext(): ComposeContext {
    return {
      products: new Map(),
      variants: new Map(),
      shops: new Map(),
    };
  }

  private async getProduct(uuid: string, context: ComposeContext) {
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

  private async getVariant(uuid: string, context: ComposeContext) {
    const cached = context.variants.get(uuid);

    if (cached) {
      return cached;
    }

    try {
      const result = await firstValueFrom(this.productProxy.send({ cmd: 'product.variant.getByUuid' }, { uuid }));
      const resultInstance = plainToInstance(VariantEntity, result);

      await validateOrReject(resultInstance);
      context.variants.set(uuid, resultInstance);

      return resultInstance;
    } catch {
      return null;
    }
  }

  private async getShop(uuid: string, context: ComposeContext) {
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

  private pickNamedEntity<T extends { uuid: string; name: string; createdAt: string; updatedAt: string }>(entity: T) {
    return {
      uuid: entity.uuid,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
