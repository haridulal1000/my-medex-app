import { useOnlineStatus } from '@hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      className="bg-amber-100 text-amber-900 text-sm text-center px-4 py-2 border-b border-amber-200"
    >
      You're offline. Some features may not work until your connection returns.
    </div>
  );
}