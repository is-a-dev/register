import { useEffect, useState } from 'react'
import api from './services/api'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        await api.get('/moods/today')
        setApiStatus('✅ API Connected')
      } catch (error) {
        setApiStatus('❌ API Error')
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  return (
    <div className="App">
      <header>
        <h1>🚀 Dayly</h1>
        <p>Track your mood, own your life</p>
      </header>
      <main>
        <div className="card">
          <h2>API Status</h2>
          <p>{loading ? '⏳ Loading...' : apiStatus}</p>
        </div>
        <div className="card">
          <h2>Welcome</h2>
          <p>Your daily mood companion - v1.0.0</p>
        </div>
      </main>
      <footer>
        <p>Made with ❤️ for your mental wellness</p>
      </footer>
    </div>
  )
}

export default App
