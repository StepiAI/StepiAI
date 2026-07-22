import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import { getLifePlan, LifePlanDetail } from '../../../services/lifePlan/client';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not load this life plan.';
}

type State = {
  plan: LifePlanDetail | null;
  loading: boolean;
  error: string | null;
};

const INITIAL: State = { plan: null, loading: true, error: null };

export function useLifePlanDetail(lifePlanId: string) {
  const [state, setState] = useState<State>(INITIAL);

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const plan = await getLifePlan(lifePlanId);
      setState({ plan, loading: false, error: null });
    } catch (err) {
      console.error('[LifePlan] failed to load life plan detail:', err);
      setState({ plan: null, loading: false, error: describeError(err) });
    }
  }, [lifePlanId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
