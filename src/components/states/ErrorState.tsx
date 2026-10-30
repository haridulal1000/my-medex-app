import { Button } from '@mui/material';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-lg border border-rose-200">
      <div className="text-rose-700 font-semibold text-lg">
        Something went wrong
      </div>
      <div className="text-slate-500 text-sm mt-2">
        We couldn't load the results.
      </div>
      <Button
        variant="contained"
        color="error"
        onClick={onRetry}
        className="!mt-4"
      >
        Retry
      </Button>
    </div>
  );
}