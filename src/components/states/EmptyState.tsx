import { Button } from '@mui/material';

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-lg border border-slate-200">
      <div className="text-slate-800 font-semibold text-lg">
        No services match your filters
      </div>
      <div className="text-slate-500 text-sm mt-2">
        Try widening your search or clearing a filter.
      </div>
      <Button variant="contained" onClick={onClear} className="!mt-4">
        Clear all filters
      </Button>
    </div>
  );
}