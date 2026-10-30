import type { SearchResponse } from '@domain/search';
import type { PageSize } from '@state/urlState';
import { ProviderCard } from './ProviderCard';
import { PaginationBar } from './PaginationBar';

export function ResultsPanel({
  search,
  onPageChange,
  onPageSizeChange,
}: {
  search: SearchResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}) {
  return (
    <div>
      <div className="space-y-4">
        {search.groups.map((g) => (
          <ProviderCard
            key={g.provider.id}
            provider={g.provider}
            services={g.services}
          />
        ))}
      </div>
      <PaginationBar
        page={search.pagination.page}
        pageSize={search.pagination.pageSize as PageSize}
        totalPages={search.pagination.totalPages}
        totalProviders={search.pagination.totalProviders}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}