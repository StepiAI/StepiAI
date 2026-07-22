import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import { listLifePlans, LifePlanRecord } from '../../../services/lifePlan/client';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not load your life plans.';
}

type State = {
  plans: LifePlanRecord[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

const INITIAL: State = { plans: [], loading: true, refreshing: false, error: null };

export function useLifePlans() {
  const [state, setState] = useState<State>(INITIAL);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    setState(prev => ({
      ...prev,
      loading: mode === 'initial',
      refreshing: mode === 'refresh',
      error: null,
    }));

    try {
      const plans = await listLifePlans();
      setState({ plans, loading: false, refreshing: false, error: null });
    } catch (err) {
      console.error('[LifePlan] failed to list life plans:', err);
      setState({ plans: [], loading: false, refreshing: false, error: describeError(err) });
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { ...state, refresh };
}
