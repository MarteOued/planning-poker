import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PMSetupPage from './pages/PMSetupPage'
import JoinSessionPage from './pages/JoinSessionPage'
import WaitingRoom from './pages/WaitingRoom'
import GameRoom from './pages/GameRoom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pm-setup" element={<PMSetupPage />} />
        <Route path="/join" element={<JoinSessionPage />} />
        <Route path="/waiting/:sessionId" element={<WaitingRoom />} />
        <Route path="/game/:sessionId" element={<GameRoom />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App