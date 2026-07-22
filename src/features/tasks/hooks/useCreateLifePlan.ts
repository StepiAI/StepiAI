import { useCallback, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import { createLifePlan, LifePlanRecord } from '../../../services/lifePlan/client';
import { LifePlanDraft } from '../types';
import { toCreateLifePlanRequest } from '../utils/lifePlanMapping';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not create the life plan.';
}

export function useCreateLifePlan() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (draft: LifePlanDraft): Promise<LifePlanRecord | null> => {
    setSaving(true);
    setError(null);

    try {
      return await createLifePlan(toCreateLifePlanRequest(draft));
    } catch (err) {
      console.error('[LifePlan] failed to create life plan:', err);
      setError(describeError(err));
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { create, saving, error, reset };
}
