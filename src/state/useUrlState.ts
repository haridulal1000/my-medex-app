import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseUrl, serializeUrl } from './urlState';
import type { UrlState } from './urlState';

export function useUrlState() {
  const [sp, setSp] = useSearchParams();
  const searchString = sp.toString();
  const state = useMemo(
    () => parseUrl(new URLSearchParams(searchString)),
    [searchString],
  );

  const update = useCallback(
    (
      updater: (prev: UrlState) => UrlState,
      opts: { replace?: boolean } = {},
    ) => {
      setSp(
        (prevSp) => {
          const prev = parseUrl(prevSp);
          const next = updater(prev);
          return serializeUrl(next);
        },
        { replace: opts.replace ?? false },
      );
    },
    [setSp],
  );

  const reset = useCallback(() => {
    setSp(new URLSearchParams(), { replace: false });
  }, [setSp]);

  return { state, update, reset };
}