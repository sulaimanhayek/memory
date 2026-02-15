import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="hero-container">
      <div className="hero-text">
        <h2><strong>What and how do people remember?</strong></h2>
        <p className="hero-bio">
          This MSc project is led by <a href="https://suliahmed.com" target="_blank" rel="noopener noreferrer">Sulaiman Ahmed</a> under the supervision of <a href="https://www.warrickroseboom.com/" target="_blank" rel="noopener noreferrer">Dr. Warrick Roseboom</a> at the University of Sussex. The research examines episodic memory through human behavioral data, fMRI scans, and model-segmented events. The findings are validated through an online study measuring people's recall of natural video scenes.
        </p>
        <Link to="/about" className="hero-button">LEARN MORE ABOUT THE PROJECT &rarr;</Link>
      </div>
      <div className="hero-image">
        <img src="/brain.png" alt="brain image" />
      </div>
    </div>
  )
}

export default Home
