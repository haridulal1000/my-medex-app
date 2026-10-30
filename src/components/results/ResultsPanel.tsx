import type { SearchResponse } from '@domain/search';
import { ProviderCard } from './ProviderCard';
import { PaginationBar } from './PaginationBar';

export function ResultsPanel({
  search,
  onPageChange,
}: {
  search: SearchResponse;
  onPageChange: (page: number) => void;
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
        totalPages={search.pagination.totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}