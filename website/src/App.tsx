import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import AITeam from './pages/AITeam'
import Legal from './pages/Legal'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="ai-team" element={<AITeam />} />
        <Route path="legal" element={<Legal />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}
