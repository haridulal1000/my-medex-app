import { describe, expect, it } from 'vitest';
import {
  calculatePrice,
  getDisplayPrice,
  getWellnessCheapest,
} from '../pricing';
import type { Service } from '../../api/schemas';

const baseSvc = (over: Partial<Service> = {}): Service =>
  ({
    id: 's',
    title: 's',
    slug: 's',
    type: 'package',
    userId: 1,
    categoryId: null,
    subCategoryId: null,
    price: '100.00',
    discount: null,
    discountType: null,
    serviceCharge: null,
    serviceChargeType: null,
    status: true,
    testAtHome: false,
    homeTestCharge: null,
    wellnessPricing: [],
    createdAt: '',
    ...over,
  }) as Service;

describe('calculatePrice', () => {
  it('applies percent discount, then percent service charge, in order', () => {
    // 6200 → 10% off → 5580 → +7% → 5970.6
    const r = calculatePrice({
      price: '6200.00',
      discount: '10.00',
      discountType: 'percent',
      serviceCharge: '7.00',
      serviceChargeType: 'percent',
    });
    expect(r).not.toBeNull();
    expect(r!.originalPrice).toBe(6200);
    expect(r!.finalPrice).toBeCloseTo(5970.6, 6);
  });

  it('applies amount discount and amount service charge', () => {
    const r = calculatePrice({
      price: '1000.00',
      discount: '100.00',
      discountType: 'amount',
      serviceCharge: '50.00',
      serviceChargeType: 'amount',
    });
    expect(r!.finalPrice).toBe(950);
  });

  it('treats a percent charge as a percentage of the post-discount amount', () => {
    // If it were % of original: 1000 - 100 + 100 = 1000
    // Correct (% of 900):      1000 - 100 +  90 = 990
    const r = calculatePrice({
      price: '1000.00',
      discount: '100.00',
      discountType: 'amount',
      serviceCharge: '10.00',
      serviceChargeType: 'percent',
    });
    expect(r!.finalPrice).toBe(990);
  });

  it('does not round in the middle of the calculation', () => {
    const r = calculatePrice({
      price: '99.99',
      discount: '33.33',
      discountType: 'percent',
      serviceCharge: '0',
      serviceChargeType: 'amount',
    });
    // (99.99 * 33.33) / 100 = 33.326667 exactly; 99.99 - 33.326667 = 66.663333
    expect(r!.finalPrice).toBeCloseTo(99.99 - (99.99 * 33.33) / 100, 10);
  });

  it('returns null when price is null (wellness base)', () => {
    const r = calculatePrice({
      price: null,
      discount: null,
      discountType: null,
      serviceCharge: null,
      serviceChargeType: null,
    });
    expect(r).toBeNull();
  });

  it('returns null for malformed price strings', () => {
    const r = calculatePrice({
      price: 'not-a-number',
      discount: null,
      discountType: null,
      serviceCharge: null,
      serviceChargeType: null,
    });
    expect(r).toBeNull();
  });
});

describe('getWellnessCheapest', () => {
  it('returns the cheapest option by final price', () => {
    const svc = baseSvc({
      type: 'wellness',
      price: null,
      wellnessPricing: [
        {
          id: 'a',
          durationInMinutes: 60,
          price: '1800.00',
          discount: '0.00',
          discountType: 'amount',
          serviceCharge: '0.00',
          serviceChargeType: 'amount',
        },
        {
          id: 'b',
          durationInMinutes: 90,
          price: '2400.00',
          discount: '15.00',
          discountType: 'percent',
          serviceCharge: '0.00',
          serviceChargeType: 'amount',
        },
      ],
    });
    // a: 1800; b: 2400 - 360 = 2040 → a wins
    expect(getWellnessCheapest(svc)!.finalPrice).toBe(1800);
  });

  it('returns null when there are no options', () => {
    const svc = baseSvc({ type: 'wellness', price: null, wellnessPricing: [] });
    expect(getWellnessCheapest(svc)).toBeNull();
  });
});

describe('getDisplayPrice', () => {
  it('uses final price for non-wellness', () => {
    const svc = baseSvc({
      price: '1000.00',
      discount: '10.00',
      discountType: 'percent',
      serviceCharge: '0.00',
      serviceChargeType: 'amount',
    });
    expect(getDisplayPrice(svc)).toBe(900);
  });

  it('uses cheapest wellness option for wellness', () => {
    const svc = baseSvc({
      type: 'wellness',
      price: null,
      wellnessPricing: [
        {
          id: 'a',
          durationInMinutes: 60,
          price: '1800.00',
          discount: null,
          discountType: null,
          serviceCharge: null,
          serviceChargeType: null,
        },
        {
          id: 'b',
          durationInMinutes: 90,
          price: '1200.00',
          discount: null,
          discountType: null,
          serviceCharge: null,
          serviceChargeType: null,
        },
      ],
    });
    expect(getDisplayPrice(svc)).toBe(1200);
  });
});