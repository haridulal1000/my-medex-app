import type { Service } from '../api/schemas';
import { parseMoney } from './money';

export interface PriceResult {
  /** The base price before any discount or service charge. */
  originalPrice: number;
  /** What the customer actually pays. */
  finalPrice: number;
}

export interface PricingFields {
  price: string | null | undefined;
  discount: string | null | undefined;
  discountType: 'percent' | 'amount' | null | undefined;
  serviceCharge: string | null | undefined;
  serviceChargeType: 'percent' | 'amount' | null | undefined;
}

/**
 * The canonical pricing formula from the brief. NO rounding mid-calc —
 * rounding is a display concern (formatMoney handles it).
 *
 *   discountAmount = discountType === 'percent'
 *       ? price * discount / 100
 *       : discount            // 'amount' or unknown
 *   afterDiscount  = price - discountAmount
 *   chargeAmount   = serviceChargeType === 'percent'
 *       ? afterDiscount * serviceCharge / 100
 *       : serviceCharge       // 'amount' or unknown
 *   finalPrice     = afterDiscount + chargeAmount
 */
export function calculatePrice(fields: PricingFields): PriceResult | null {
  const price = parseMoney(fields.price);
  if (price === null) return null;

  const rawDiscount = parseMoney(fields.discount) ?? 0;
  const discountAmount =
    fields.discountType === 'percent'
      ? (price * rawDiscount) / 100
      : fields.discountType === 'amount'
        ? rawDiscount
        : 0;

  const afterDiscount = price - discountAmount;

  const rawCharge = parseMoney(fields.serviceCharge) ?? 0;
  const chargeAmount =
    fields.serviceChargeType === 'percent'
      ? (afterDiscount * rawCharge) / 100
      : fields.serviceChargeType === 'amount'
        ? rawCharge
        : 0;

  return { originalPrice: price, finalPrice: afterDiscount + chargeAmount };
}

/**
 * Wellness services have no single price. We return the cheapest duration
 * option so the customer sees an honest "from ฿X". If there are no options
 * we return null and the UI shows "Pricing by duration".
 */
export function getWellnessCheapest(service: Service): PriceResult | null {
  if (!service.wellnessPricing || service.wellnessPricing.length === 0) {
    return null;
  }
  let best: PriceResult | null = null;
  for (const opt of service.wellnessPricing) {
    const p = calculatePrice({
      price: opt.price,
      discount: opt.discount,
      discountType: opt.discountType,
      serviceCharge: opt.serviceCharge,
      serviceChargeType: opt.serviceChargeType,
    });
    if (p && (!best || p.finalPrice < best.finalPrice)) best = p;
  }
  return best;
}

/**
 * A single display price used for filtering and sorting.
 * Wellness → cheapest option. Others → final price.
 * Null when unknown (wellness with no options, malformed price, etc.).
 */
export function getDisplayPrice(service: Service): number | null {
  if (service.type === 'wellness') {
    return getWellnessCheapest(service)?.finalPrice ?? null;
  }
  return calculatePrice(service)?.finalPrice ?? null;
}