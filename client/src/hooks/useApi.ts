import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: false, error: null })

  const execute = useCallback(async (fn: () => Promise<{ data: T }>) => {
    setState({ data: null, loading: true, error: null })
    try {
      const result = await fn()
      setState({ data: result.data, loading: false, error: null })
      return result.data
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message })
      throw err
    }
  }, [])

  return { ...state, execute }
}
