import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'finance-track:theme'
const TRANSITION_CLASS = 'theme-transition'

function resolveInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.toggle('dark', isDark)
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState(resolveInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    const root = document.documentElement

    root.classList.add(TRANSITION_CLASS)

    const timerId = window.setTimeout(() => {
      root.classList.remove(TRANSITION_CLASS)
    }, 250)

    return () => {
      window.clearTimeout(timerId)
      root.classList.remove(TRANSITION_CLASS)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  }
}