import { useCallback, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import { createStudyPlan, StudyPlanRecord } from '../../../services/studyPlan/client';
import { StudyPlanDraft } from '../types';
import { toCreateStudyPlanRequest } from '../utils/studyPlanMapping';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not create the study plan.';
}

export function useCreateStudyPlan() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (draft: StudyPlanDraft): Promise<StudyPlanRecord | null> => {
    setSaving(true);
    setError(null);

    try {
      return await createStudyPlan(toCreateStudyPlanRequest(draft));
    } catch (err) {
      console.error('[StudyPlan] failed to create study plan:', err);
      setError(describeError(err));
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { create, saving, error, reset };
}
