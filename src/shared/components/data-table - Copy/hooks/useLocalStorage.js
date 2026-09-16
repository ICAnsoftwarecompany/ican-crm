import { useEffect, useState } from 'react'
import { STORAGE_KEY_PREFIX, STORAGE_VERSION } from '../constants'

export function useLocalStorage(key, initialValue) {
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(storageKey)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      // Validate version (optional)
      if (parsed._version !== STORAGE_VERSION) {
        return initialValue
      }

      return parsed.value
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          _version: STORAGE_VERSION,
          value: valueToStore,
        })
      )
    } catch (error) {
      console.warn(`Error writing to localStorage key "${storageKey}":`, error)
    }
  }

  return [storedValue, setValue]
}
