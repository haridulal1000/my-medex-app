import type { Category, Provider, Service } from '../api/schemas';

export interface VisibilityMaps {
  providerById: Map<number, Provider>;
  categoryById: Map<string, Category>;
}

/**
 * A service is visible iff ALL THREE hold:
 *   1. service.status === true
 *   2. provider exists AND provider.status === 'active'
 *   3. the service's top-level category (if set) has status === true
 *
 * We deliberately check only the TOP-LEVEL category's status. Sub-category
 * status is not part of the brief's visibility rule, so a service with an
 * inactive sub-category but an active parent still shows — this matches the
 * literal wording of the brief.
 */
export function isServiceVisible(
  service: Service,
  maps: VisibilityMaps,
): boolean {
  if (service.status !== true) return false;

  const provider = maps.providerById.get(service.userId);
  if (!provider || provider.status !== 'active') return false;

  if (service.categoryId) {
    const cat = maps.categoryById.get(service.categoryId);
    if (!cat || cat.status !== true) return false;
  }

  return true;
}

export function buildVisibilityMaps(
  providers: Provider[],
  categories: Category[],
): VisibilityMaps {
  return {
    providerById: new Map(providers.map((p) => [p.id, p])),
    // Key by id, NOT by slug. The brief warns that two categories can share
    // a slug when their types differ — id is the only safe identity.
    categoryById: new Map(categories.map((c) => [c.id, c])),
  };
}