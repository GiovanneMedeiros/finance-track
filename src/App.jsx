import { useLocalStorage } from '@/hooks/useLocalStorage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    'finance-track:demo-authenticated',
    false,
  )

  if (!isAuthenticated) {
    return <AuthPage onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return <DashboardPage onSignOut={() => setIsAuthenticated(false)} />
}

export default App
