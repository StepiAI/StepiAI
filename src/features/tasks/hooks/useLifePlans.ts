import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  deleteLifePlan,
  listLifePlans,
  setLifePlanArchived,
  LifePlanRecord,
} from '../../../services/lifePlan/client';

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

  const setArchived = useCallback(async (id: string, archived: boolean) => {
    setState(prev => ({
      ...prev,
      plans: prev.plans.map(plan => (plan.id === id ? { ...plan, archived } : plan)),
    }));

    try {
      await setLifePlanArchived(id, archived);
    } catch (err) {
      console.error('[LifePlan] failed to archive life plan:', err);
      setState(prev => ({
        ...prev,
        plans: prev.plans.map(plan =>
          plan.id === id ? { ...plan, archived: !archived } : plan,
        ),
      }));
      throw err;
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const snapshot = state.plans;

      setState(prev => ({ ...prev, plans: prev.plans.filter(plan => plan.id !== id) }));

      try {
        await deleteLifePlan(id);
      } catch (err) {
        console.error('[LifePlan] failed to delete life plan:', err);
        setState(prev => ({ ...prev, plans: snapshot }));
        throw err;
      }
    },
    [state.plans],
  );

  return { ...state, refresh, setArchived, remove };
}
