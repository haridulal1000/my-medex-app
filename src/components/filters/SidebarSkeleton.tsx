import { Skeleton } from '@mui/material';

export function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4" aria-busy="true">
      <Skeleton height={40} />
      <Skeleton width="40%" height={20} />
      <Skeleton height={120} />
      <Skeleton width="40%" height={20} />
      <Skeleton height={160} />
      <Skeleton width="40%" height={20} />
      <Skeleton height={100} />
    </div>
  );
}