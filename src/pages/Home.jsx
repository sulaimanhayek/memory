import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

const quotes = [
  { text: '"You remember too much, my mother said to me recently. Why hold onto all that? And I said, Where can I put it down?"', attribution: '— Anne Carson' },
  { text: '"Memory is all we are. Moments and feelings, captured in amber, strung on filaments of reason. Take a man\'s memories and you take all of him."', attribution: '— Mark Lawrence' },
  { text: '"The memory of everything is very soon overwhelmed in time."', attribution: '— Marcus Aurelius' },
  { text: '"Your Remedy is within you, but you do not sense it. Your Sickness is from you, but you do not perceive it. You Presume you are a small entity, But within you is enfolded the entire universe. You are indeed the evident book, By whose alphabet the hidden becomes the manifest. Therefore, you have no need to look beyond yourself, What you seek is within you, if only you reflect."', attribution: '— Ali ibn Abi Talib' },
]

function Home() {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(() => sessionStorage.getItem('introSeen') === 'true')
  const transitioning = useRef(false)

  // Fade in the first quote on mount
  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [done])

  const advance = useCallback(() => {
    if (transitioning.current || done) return
    transitioning.current = true

    // Fade out current quote
    setVisible(false)

    setTimeout(() => {
      setCurrentQuote(prev => {
        const next = prev + 1
        if (next >= quotes.length) {
          setDone(true)
          sessionStorage.setItem('introSeen', 'true')
          transitioning.current = false
          return prev
        }
        // Fade in next quote after a brief pause
        setTimeout(() => {
          setVisible(true)
          transitioning.current = false
        }, 200)
        return next
      })
    }, 800) // wait for fade-out transition
  }, [done])

  // Handle wheel events on the overlay
  useEffect(() => {
    if (done) return

    const handleWheel = (e) => {
      e.preventDefault()
      if (e.deltaY > 0) advance()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [done, advance])

  // Handle touch swipe on the overlay
  useEffect(() => {
    if (done) return
    let touchStartY = 0

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY
      if (deltaY > 30) advance()
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [done, advance])

  return (
    <>
      {!done && (
        <div className="quote-overlay">
          <div className="quote-content">
            <p className={`quote-text ${visible ? 'visible' : ''}`}>
              {quotes[currentQuote].text}
            </p>
            <p className={`quote-attribution ${visible ? 'visible' : ''}`}>
              {quotes[currentQuote].attribution}
            </p>
          </div>
          <div className="scroll-hint">
            <span className="scroll-hint-text">Scroll</span>
            <div className="scroll-hint-arrow">
              <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
                <path d="M10 2 L10 24 M3 18 L10 25 L17 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      )}
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
    </>
  )
}

export default Home
