import { useEffect, useRef, useState } from 'react'

export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const factoryRef = useRef(factory)
  factoryRef.current = factory
  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    factoryRef.current()
      .then((value) => {
        if (!cancelled) setData(value)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setData(null)
          setError(cause instanceof Error ? cause.message : 'Неизвестная ошибка')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [depsKey, tick])

  return {
    data,
    error,
    loading,
    reload: () => setTick((value) => value + 1),
  }
}
