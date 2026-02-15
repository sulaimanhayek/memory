import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Blog from './pages/Blog'
import ArchitectureOfRemembering from './pages/chapters/ArchitectureOfRemembering'
import SegmentingExperience from './pages/chapters/SegmentingExperience'
import CnnModel from './pages/chapters/CnnModel'
import PerceptionCensusModel from './pages/chapters/PerceptionCensusModel'
import FmriAndRecall from './pages/chapters/FmriAndRecall'
import MeasuringMemory from './pages/chapters/MeasuringMemory'
import Discussion from './pages/chapters/Discussion'
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
          <Route path="/chapters/introduction" element={<ArchitectureOfRemembering />} />
          <Route path="/chapters/event-segmentation" element={<SegmentingExperience />} />
          <Route path="/chapters/cnn-model" element={<CnnModel />} />
          <Route path="/chapters/perception-census-model" element={<PerceptionCensusModel />} />
          <Route path="/chapters/fmri-model" element={<FmriAndRecall />} />
          <Route path="/chapters/online-behavioural-study" element={<MeasuringMemory />} />
          <Route path="/chapters/discussion" element={<Discussion />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </main>
    </>
  )
}

export default App
