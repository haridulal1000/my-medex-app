import { describe, expect, it } from 'vitest';
import { computeFacets } from '../facets';
import { EMPTY_FILTERS, FilterContext } from '../filter';
import type { Category, Provider, Service } from '../../api/schemas';

// --- fixtures ---
const bkk: Provider = {
  id: 1,
  name: 'Bangkok Hospital',
  username: 'bkk',
  status: 'active',
  providerInformation: {
    companyName: 'Bangkok Hospital',
    slug: 'bkk',
    types: ['package', 'lab_test'],
    currency: 'THB',
    city: { id: 'bkk', name: 'Bangkok', slug: 'bangkok' },
    country: { id: 1, name: 'Thailand', alphaCode: 'TH' },
    rating: 4.7,
    reviewCount: 100,
  },
};

const chiangMai: Provider = {
  id: 2,
  name: 'Chiang Mai Lab',
  username: 'cm',
  status: 'active',
  providerInformation: {
    companyName: 'Chiang Mai Lab',
    slug: 'cm',
    types: ['lab_test'],
    currency: 'THB',
    city: { id: 'cm', name: 'Chiang Mai', slug: 'chiang-mai' },
    country: { id: 1, name: 'Thailand', alphaCode: 'TH' },
    rating: null,
    reviewCount: null,
  },
};

const catPackage: Category = {
  id: 'cat-pkg',
  title: 'Health Check',
  slug: 'health-check',
  type: 'package',
  status: true,
  parentId: null,
};

const subPkg: Category = {
  id: 'sub-pkg',
  title: 'Executive',
  slug: 'executive',
  type: 'package',
  status: true,
  parentId: 'cat-pkg',
};

const catLab: Category = {
  id: 'cat-lab',
  title: 'Lab tests',
  slug: 'lab-tests',
  type: 'lab_test',
  status: true,
  parentId: null,
};

const svc = (over: Partial<Service>): Service =>
  ({
    id: Math.random().toString(),
    title: 's',
    slug: 's',
    type: 'package',
    userId: 1,
    categoryId: null,
    subCategoryId: null,
    price: '1000.00',
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

const makeCtx = (
  providers: Provider[],
  categories: Category[],
): FilterContext => ({
  providerById: new Map(providers.map((p) => [p.id, p])),
  categoryById: new Map(categories.map((c) => [c.id, c])),
});

describe('computeFacets', () => {
  it('type facet counts per type with all other filters applied', () => {
    const services = [
      svc({ type: 'package', userId: 1, categoryId: 'cat-pkg' }),
      svc({ type: 'package', userId: 1, categoryId: 'cat-pkg' }),
      svc({ type: 'lab_test', userId: 1, categoryId: 'cat-lab' }),
      svc({ type: 'lab_test', userId: 2, categoryId: 'cat-lab' }),
    ];
    const ctx = makeCtx([bkk, chiangMai], [catPackage, subPkg, catLab]);

    // No filters active: counts are raw.
    const facets0 = computeFacets(
      services,
      EMPTY_FILTERS,
      ctx,
    );
    expect(facets0.types.package).toBe(2);
    expect(facets0.types.lab_test).toBe(2);

    // Now select Bangkok. Type facet should show how many of EACH type would
    // be visible if only that type were selected, keeping Bangkok active.
    const withBkk = { ...EMPTY_FILTERS, city: 'Bangkok' };
    const facets1 = computeFacets(services, withBkk, ctx);
    expect(facets1.types.package).toBe(2); // 2 package services in Bangkok
    expect(facets1.types.lab_test).toBe(1); // only 1 lab test in Bangkok
  });

  it('city facet ignores the current city filter (so you can switch city)', () => {
    const services = [
      svc({ userId: 1, type: 'package', categoryId: 'cat-pkg' }),
      svc({ userId: 2, type: 'lab_test', categoryId: 'cat-lab' }),
    ];
    const ctx = makeCtx([bkk, chiangMai], [catPackage, catLab]);
    const withBkk = { ...EMPTY_FILTERS, city: 'Bangkok' };
    const facets = computeFacets(services, withBkk, ctx);
    // Bangkok is applied as a filter, but the city facet should still show
    // counts for Chiang Mai so the user can switch.
    expect(facets.cityCounts.Bangkok).toBe(1);
    expect(facets.cityCounts['Chiang Mai']).toBe(1);
  });
});