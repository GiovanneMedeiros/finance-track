import { useEffect, useState } from 'react'

import { loadStorageValue, saveStorageValue } from '@/services/storage'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadStorageValue(key, initialValue))

  useEffect(() => {
    saveStorageValue(key, value)
  }, [key, value])

  return [value, setValue]
}