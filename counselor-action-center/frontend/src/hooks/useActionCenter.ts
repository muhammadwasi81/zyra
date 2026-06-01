import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { ActionCenterData } from "../types";

interface UseActionCenterReturn {
  data: ActionCenterData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActionCenter(studentId: string): UseActionCenterReturn {
  const [data, setData] = useState<ActionCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getActionCenter(studentId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load action center");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
