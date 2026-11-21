import { BadRequestException } from '@nestjs/common';

type LegacyPrice = { offerUuid: string } & Record<string, unknown>;
type LegacyOffer = {
  uuid: string;
  currentPrice?: LegacyPrice | null;
  prices?: LegacyPrice[];
  records: Record<string, unknown>[];
};

export function legacyStoreProduct(input: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(input.offers)) throw new BadRequestException('Invalid legacy Store snapshot');
  return {
    ...input,
    offers: (input.offers as LegacyOffer[]).map((offer) => {
      if (!offer || typeof offer !== 'object') throw new BadRequestException('Invalid legacy offer');
      if (!Array.isArray(offer.records) || (offer.currentPrice && offer.currentPrice.offerUuid !== offer.uuid))
        throw new BadRequestException('Invalid legacy offer');
      if (
        (offer.prices !== undefined && !Array.isArray(offer.prices)) ||
        offer.records.some((record) => !record || typeof record !== 'object')
      )
        throw new BadRequestException('Invalid legacy record or price history');
      return {
        ...offer,
        records: offer.records.map((record) => ({
          ...record,
          currentPrice: offer.currentPrice ? { ...offer.currentPrice, recordUuid: record.uuid } : null,
          prices: (offer.prices ?? []).map((price) => {
            if (!price || price.offerUuid !== offer.uuid) throw new BadRequestException('Invalid legacy price');
            return { ...price, recordUuid: record.uuid };
          }),
        })),
      };
    }),
  };
}
