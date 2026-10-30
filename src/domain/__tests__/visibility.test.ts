import { describe, expect, it } from 'vitest';
import { buildVisibilityMaps, isServiceVisible } from '../visibility';
import type { Category, Provider, Service } from '../../api/schemas';

const provider = (id: number, status: string): Provider => ({
  id,
  name: `P${id}`,
  username: `p${id}`,
  status,
  providerInformation: null,
});

const category = (id: string, status: boolean): Category => ({
  id,
  title: id,
  slug: id,
  type: 'package',
  status,
  parentId: null,
});

const service = (over: Partial<Service> = {}): Service =>
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

describe('isServiceVisible', () => {
  it('hidden when service.status is false', () => {
    const maps = buildVisibilityMaps([provider(1, 'active')], []);
    expect(isServiceVisible(service({ status: false }), maps)).toBe(false);
  });

  it('hidden when the provider is not active', () => {
    const maps = buildVisibilityMaps([provider(1, 'inactive')], []);
    expect(isServiceVisible(service({}), maps)).toBe(false);
  });

  it('hidden when the provider is missing entirely', () => {
    const maps = buildVisibilityMaps([], []);
    expect(isServiceVisible(service({ userId: 99 }), maps)).toBe(false);
  });

  it('hidden when the service has an inactive category', () => {
    const maps = buildVisibilityMaps(
      [provider(1, 'active')],
      [category('c1', false)],
    );
    expect(isServiceVisible(service({ categoryId: 'c1' }), maps)).toBe(false);
  });

  it('hidden when the service points at a missing category', () => {
    const maps = buildVisibilityMaps([provider(1, 'active')], []);
    expect(isServiceVisible(service({ categoryId: 'nope' }), maps)).toBe(false);
  });

  it('visible when all three conditions hold', () => {
    const maps = buildVisibilityMaps(
      [provider(1, 'active')],
      [category('c1', true)],
    );
    expect(isServiceVisible(service({ categoryId: 'c1' }), maps)).toBe(true);
  });

  it('visible when the service has no category (rule only applies "if it has one")', () => {
    const maps = buildVisibilityMaps([provider(1, 'active')], []);
    expect(isServiceVisible(service({ categoryId: null }), maps)).toBe(true);
  });
});