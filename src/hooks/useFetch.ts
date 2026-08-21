import { useCallback, useEffect, useState } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  autoFetch = true,
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();

      setData(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar os dados';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (autoFetch) {
      void execute();
    }
  }, [autoFetch, execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}