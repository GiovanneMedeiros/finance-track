export function loadStorageValue(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return fallbackValue
    }

    return JSON.parse(storedValue)
  } catch {
    return fallbackValue
  }
}

export function saveStorageValue(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}