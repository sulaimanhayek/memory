import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Blog from './pages/Blog'
import Welcome from './pages/posts/Welcome'
import PostWithCode from './pages/posts/PostWithCode'
import References from './pages/References'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/posts/welcome" element={<Welcome />} />
          <Route path="/posts/post-with-code" element={<PostWithCode />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </main>
    </>
  )
}

export default App
