import { useCategories, useProviders, useServices } from '../hooks/useCatalog';

export default function ServiceExplorerPage() {
  const categories = useCategories();
  const providers = useProviders();
  const services = useServices();

  const loading =
    categories.isLoading || providers.isLoading || services.isLoading;

  const anyError = categories.error ?? providers.error ?? services.error;

  const refetchAll = () => {
    void categories.refetch();
    void providers.refetch();
    void services.refetch();
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Service Explorer</h1>
      <p className="text-slate-600 mt-1 text-sm">
        Data pipeline sanity check (commit 2)
      </p>

      {loading && <p className="mt-6 text-slate-600">Loading…</p>}

      {anyError && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded">
          <p className="text-rose-700 font-medium">API failed</p>
          <p className="text-sm text-rose-600 mt-1">{String(anyError)}</p>
          <button
            onClick={refetchAll}
            className="mt-3 px-3 py-1 rounded bg-rose-600 text-white text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !anyError && (
        <dl className="mt-6 grid grid-cols-3 gap-4 max-w-xl">
          <div className="bg-white p-4 rounded border border-slate-200">
            <dt className="text-xs text-slate-500">Categories</dt>
            <dd className="text-2xl font-semibold">
              {categories.data?.length ?? '—'}
            </dd>
          </div>
          <div className="bg-white p-4 rounded border border-slate-200">
            <dt className="text-xs text-slate-500">Providers</dt>
            <dd className="text-2xl font-semibold">
              {providers.data?.length ?? '—'}
            </dd>
          </div>
          <div className="bg-white p-4 rounded border border-slate-200">
            <dt className="text-xs text-slate-500">Services</dt>
            <dd className="text-2xl font-semibold">
              {services.data?.length ?? '—'}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}