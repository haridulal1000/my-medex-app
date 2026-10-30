import { Button } from '@mui/material';
import { isAxiosError } from 'axios';
import { useOnlineStatus } from '@hooks/useOnlineStatus';

interface Message {
  title: string;
  description: string;
}

function classify(error: unknown, online: boolean): Message {
  if (!online) {
    return {
      title: "You're offline",
      description: 'Check your internet connection and try again.',
    };
  }
  if (isAxiosError(error)) {
    if (!error.response) {
      return {
        title: 'Could not reach the server',
        description: 'Check your connection or try again in a moment.',
      };
    }
    const status = error.response.status;
    if (status >= 500) {
      return {
        title: 'Something went wrong on our side',
        description: 'Please try again in a moment.',
      };
    }
    if (status === 404) {
      return {
        title: 'Not found',
        description: 'The requested resource does not exist.',
      };
    }
    return {
      title: 'Request failed',
      description: `Server responded with ${status}.`,
    };
  }
  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred.',
  };
}

export function ErrorState({
  error,
  onRetry,
  compact = false,
}: {
  error: unknown;
  onRetry: () => void;
  compact?: boolean;
}) {
  const online = useOnlineStatus();
  const { title, description } = classify(error, online);

  return (
    <div
      role="alert"
      className={`text-center ${compact ? 'py-6' : 'py-16'} px-4 bg-white rounded-lg border border-rose-200`}
    >
      <div className="text-rose-700 font-semibold text-lg">{title}</div>
      <div className="text-slate-500 text-sm mt-2">{description}</div>
      <Button
        variant="contained"
        color="error"
        onClick={onRetry}
        className="!mt-4"
        disabled={!online}
      >
        {online ? 'Retry' : 'Waiting for connection…'}
      </Button>
    </div>
  );
}