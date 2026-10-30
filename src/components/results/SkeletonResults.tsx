import { Skeleton } from '@mui/material';

export function SkeletonResults() {
  return (
    <div className="space-y-4" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-slate-200 p-4 space-y-3"
        >
          <Skeleton width="40%" height={24} />
          <Skeleton width="25%" height={16} />
          <div className="space-y-2 pt-2">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        </div>
      ))}
    </div>
  );
}