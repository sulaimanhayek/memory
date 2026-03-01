import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import About from './pages/About'
import Blog from './pages/Blog'
import ChapterPage from './pages/ChapterPage'
import References from './pages/References'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/chapters" element={<Blog />} />
          <Route path="/chapters/:slug" element={<ChapterPage />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </main>
      <ChatWidget />
    </>
  )
}

export default App
