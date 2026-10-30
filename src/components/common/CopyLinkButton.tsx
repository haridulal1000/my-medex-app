import { useState } from 'react';
import { Button } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permissions blocked — nothing useful to do silently
    }
  };

  return (
    <Button
      size="small"
      variant="text"
      onClick={() => void copy()}
      startIcon={
        copied ? (
          <CheckIcon fontSize="small" />
        ) : (
          <LinkIcon fontSize="small" />
        )
      }
      aria-live="polite"
    >
      {copied ? 'Copied' : 'Copy link'}
    </Button>
  );
}