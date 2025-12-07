import { useCallback, useEffect, useState } from 'react'

const parseJSON = (value) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    const stored = window.localStorage.getItem(key)
    return stored !== null ? parseJSON(stored) : initialValue
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState(readValue)

  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  const setValue = useCallback(
    (value) => {
      if (typeof window === 'undefined') return
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

export default useLocalStorage

