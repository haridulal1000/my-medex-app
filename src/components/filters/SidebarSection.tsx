import { useCategories, useProviders } from '@hooks/useCatalog';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import { FilterSidebar } from './FilterSidebar';

export function SidebarSection() {
  const { state } = useUrlState();
  const categoriesQ = useCategories();
  const providersQ = useProviders();
  const search = useServiceSearch(state);

  return (
    <FilterSidebar
      facets={search.data!.facets}
      topCategories={categoriesQ.data ?? []}
      providers={providersQ.data ?? []}
    />
  );
}