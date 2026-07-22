import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import { getStudyPlan, StudyPlanDetail } from '../../../services/studyPlan/client';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not load this life plan.';
}

type State = {
  plan: StudyPlanDetail | null;
  loading: boolean;
  error: string | null;
};

const INITIAL: State = { plan: null, loading: true, error: null };

export function useStudyPlanDetail(studyPlanId: string) {
  const [state, setState] = useState<State>(INITIAL);

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const plan = await getStudyPlan(studyPlanId);
      setState({ plan, loading: false, error: null });
    } catch (err) {
      console.error('[StudyPlan] failed to load study plan detail:', err);
      setState({ plan: null, loading: false, error: describeError(err) });
    }
  }, [studyPlanId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
