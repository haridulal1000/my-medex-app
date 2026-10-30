import { AppShell } from '@components/layout/AppShell';
import { SkeletonResults } from '@components/results/SkeletonResults';
import { ResultsList } from '@components/results/ResultsList';
import { useCategories, useProviders, useServices } from '@hooks/useCatalog';
import { useUrlState } from '@state/useUrlState';

export default function ServiceExplorerPage() {
  const { state } = useUrlState();
  const categoriesQ = useCategories();
  const providersQ = useProviders();
  const servicesQ = useServices();

  const loading =
    categoriesQ.isLoading || providersQ.isLoading || servicesQ.isLoading;
  const error = categoriesQ.error ?? providersQ.error ?? servicesQ.error;

  const refetchAll = () => {
    void categoriesQ.refetch();
    void providersQ.refetch();
    void servicesQ.refetch();
  };

  const flatCategories =
    categoriesQ.data?.flatMap((c) => [c, ...c.children]) ?? [];

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
            Filters arriving in the next commit…
          </div>
        </aside>
        <section>
          {loading ? (
            <SkeletonResults />
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded">
              <p className="text-rose-700 font-medium">Something went wrong</p>
              <p className="text-sm text-rose-600 mt-1">{String(error)}</p>
              <button
                onClick={refetchAll}
                className="mt-3 px-3 py-1 rounded bg-rose-600 text-white text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <ResultsList
              services={servicesQ.data ?? []}
              providers={providersQ.data ?? []}
              categories={flatCategories}
              filters={state.filters}
              sort={state.sort}
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}