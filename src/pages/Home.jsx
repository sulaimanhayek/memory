import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const quotes = [
  { text: '"You remember too much, my mother said to me recently. Why hold onto all that? And I said, Where can I put it down?"', attribution: '— Anne Carson' },
  { text: '"Memory is all we are. Moments and feelings, captured in amber, strung on filaments of reason. Take a man\'s memories and you take all of him."', attribution: '— Mark Lawrence' },
  { text: '"The memory of everything is very soon overwhelmed in time."', attribution: '— Marcus Aurelius' },
  { text: '"Your Remedy is within you, but you do not sense it. Your Sickness is from you, but you do not perceive it. You Presume you are a small entity, But within you is enfolded the entire universe. You are indeed the evident book, By whose alphabet the hidden becomes the manifest. Therefore, you have no need to look beyond yourself, What you seek is within you, if only you reflect."', attribution: '— Ali ibn Abi Talib' },
]

const episodes = [
  {
    title: 'Chapter 1: Introduction',
    note: 'Theoretical groundwork for episodic memory and core neuroscience concepts.',
    tag: 'theory',
    time: 'Chapter 1',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/introduction',
  },
  {
    title: 'Chapter 2: Event Segmentation',
    note: 'How continuous experience is parsed into discrete rememberable events.',
    tag: 'methods',
    time: 'Chapter 2',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/event-segmentation',
  },
  {
    title: 'Chapter 3: CNN Model',
    note: 'A convolutional approach to identifying event boundaries from video.',
    tag: 'deep learning',
    time: 'Chapter 3',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/cnn-model',
  },
  {
    title: 'Chapter 4: Perception Census Model',
    note: 'A perception-led model integrating salience and subjective dimensions.',
    tag: 'perception',
    time: 'Chapter 4',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/perception-census-model',
  },
  {
    title: 'Chapter 5: fMRI-Based Model of Event Segmentation',
    note: 'Neural signatures of event boundaries and their relationship to recall.',
    tag: 'fMRI',
    time: 'Chapter 5',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/fmri-model',
  },
  {
    title: 'Chapter 6: Online Behavioural Study',
    note: 'Large-scale online validation of memory and segmentation findings.',
    tag: 'study',
    time: 'Chapter 6',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/online-behavioural-study',
  },
  {
    title: 'Chapter 7: Discussion',
    note: 'Integrated interpretation, limitations, and future directions.',
    tag: 'discussion',
    time: 'Chapter 7',
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/discussion',
  },
]

function Home() {
  const navigate = useNavigate()
  const [currentQuote, setCurrentQuote] = useState(0)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(() => sessionStorage.getItem('introSeen') === 'true')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hoveredEpisode, setHoveredEpisode] = useState(null)
  const [isPhone, setIsPhone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
  })
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(min-width: 768px) and (max-width: 1366px)').matches
  })

  const transitioning = useRef(false)
  const timelineRef = useRef(null)

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

  useEffect(() => {
    let frameId = 0

    const updateProgress = () => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        setScrollProgress(0)
        return
      }

      const raw = -rect.top / scrollable
      const bounded = Math.max(0, Math.min(1, raw))
      setScrollProgress(bounded)
    }

    const onScroll = () => {
      setHoveredEpisode(null)
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const phoneMedia = window.matchMedia('(max-width: 767px)')
    const tabletMedia = window.matchMedia('(min-width: 768px) and (max-width: 1366px)')

    const onPhoneChange = (event) => setIsPhone(event.matches)
    const onTabletChange = (event) => setIsTablet(event.matches)

    setIsPhone(phoneMedia.matches)
    setIsTablet(tabletMedia.matches)

    phoneMedia.addEventListener('change', onPhoneChange)
    tabletMedia.addEventListener('change', onTabletChange)

    return () => {
      phoneMedia.removeEventListener('change', onPhoneChange)
      tabletMedia.removeEventListener('change', onTabletChange)
    }
  }, [])

  const activeFloat = scrollProgress * episodes.length
  const activeEpisode = Math.min(episodes.length - 1, Math.floor(activeFloat))
  const useStaticCards = isPhone || isTablet

  const openEpisode = useCallback((episode) => {
    if (!episode?.slug) return
    navigate(episode.slug)
  }, [navigate])

  const getEpisodeStyle = (index) => {
    const distance = index - activeFloat
    const absDistance = Math.abs(distance)
    const hoverLift = hoveredEpisode === index ? 1 : 0
    const hoverShiftX = hoverLift ? (distance < 0 ? 10 : -10) : 0

    if (isPhone) {
      const stackAnchorX = 12
      const stackAnchorY = -174
      const futureStepY = 15
      const bottomPileX = -84
      const bottomPileY = 128
      const pileOffsetX = Math.min(index, 7) * 4
      const pileOffsetY = Math.min(index, 7) * 10
      const transition = Math.min(1, Math.max(0, -distance))
      const hoverShiftY = hoverLift ? (distance < 0 ? -10 : 8) : 0

      const passedX = stackAnchorX + (bottomPileX + pileOffsetX - stackAnchorX) * transition
      const passedY = stackAnchorY + (bottomPileY + pileOffsetY - stackAnchorY) * transition

      const translateX = distance < 0
        ? passedX
        : stackAnchorX + distance * 3

      const translateY = distance < 0
        ? passedY + hoverShiftY
        : stackAnchorY + distance * futureStepY + hoverShiftY

      const translateZ = distance < 0
        ? -Math.max(0, absDistance - 1) * 18 + hoverLift * 44
        : -absDistance * 10 + hoverLift * 44

      const scale = distance < 0
        ? Math.max(0.8, 1 - absDistance * 0.03) + hoverLift * 0.03
        : Math.max(0.85, 1 - absDistance * 0.012) + hoverLift * 0.03

      const opacity = Math.max(0.28, 1 - absDistance * 0.07)
      const rotateY = distance < 0 ? -4 : -10 + distance * 0.25
      const rotateX = 9
      const rotateZ = distance < 0 ? -2 : distance * 0.2
      const zIndex = Math.round(240 - absDistance * 8 + hoverLift * 40)

      return {
        transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        opacity,
        zIndex,
      }
    }

    const stackAnchorX = 470
    const futureStepX = 12
    const stackY = -122
    const leftPileX = -430
    const leftPileY = 136
    const pileOffsetX = Math.min(index, 7) * 12
    const pileOffsetY = Math.min(index, 7) * 7
    const transition = Math.min(1, Math.max(0, -distance))

    const passedX = stackAnchorX + (leftPileX + pileOffsetX - stackAnchorX) * transition
    const passedY = stackY + (leftPileY + pileOffsetY - stackY) * transition

    const translateY = distance < 0
      ? passedY - hoverLift * 18
      : stackY + distance * 6 - hoverLift * 18

    const translateX = distance < 0
      ? passedX + hoverShiftX
      : stackAnchorX + distance * futureStepX + hoverShiftX

    const translateZ = distance < 0
      ? -Math.max(0, absDistance - 1) * 34 + hoverLift * 60
      : -absDistance * 16 + hoverLift * 60

    const scale = distance < 0
      ? Math.max(0.72, 1 - absDistance * 0.045) + hoverLift * 0.045
      : Math.max(0.78, 1 - absDistance * 0.02) + hoverLift * 0.045

    const opacity = Math.max(0.24, 1 - absDistance * 0.07)
    const rotateY = distance < 0 ? -8 : -26 + distance * 0.35
    const rotateX = 6
    const rotateZ = distance < 0 ? -4 : distance * 0.45
    const zIndex = Math.round(240 - absDistance * 8 + hoverLift * 55)

    return {
      transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
      opacity,
      zIndex,
    }
  }

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

      <section className="memory-home">
        <div className="memory-intro">
          <p className="memory-kicker">Episodic Memory Project</p>
          <h1>How the brain stores daily life as sequential frames</h1>
          <p>
            Scroll through the episode library. Each card represents a memory unit extracted from continuous
            experience. Hover to pop one frame out of the stream and inspect it.
          </p>
          <Link to="/about" className="hero-button">LEARN MORE ABOUT THE PROJECT &rarr;</Link>
        </div>

        {useStaticCards ? (
          <div className={`mobile-chapter-list ${isTablet ? 'tablet-grid-three' : ''}`}>
            {episodes.map((episode, index) => (
              <article
                key={episode.title}
                className="mobile-episode-card"
                tabIndex={0}
                onClick={() => openEpisode(episode)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openEpisode(episode)
                  }
                }}
              >
                <div className="episode-image-wrap">
                  <img src={episode.image} alt={episode.title} />
                </div>
                <div className="episode-meta">
                  <p className="episode-time">{episode.time}</p>
                  <p className="episode-tag">{episode.tag}</p>
                </div>
                <h2>{episode.title}</h2>
                <p className="episode-note">{episode.note}</p>
                <p className="mobile-card-count">Chapter {index + 1} / {episodes.length}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="memory-timeline" ref={timelineRef}>
            <div className="memory-stage">
            <div className="playlist-text">
              <h2>Browse</h2>
              <h2 className="playlist-mid">Chapters</h2>
            </div>
              <div className="memory-stage-shell">
                {episodes.map((episode, index) => {
                  const isActive = activeEpisode === index
                  const isHovered = hoveredEpisode === index

                  return (
                    <article
                      key={episode.title}
                    className={`episode-card ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={getEpisodeStyle(index)}
                    onClick={() => openEpisode(episode)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openEpisode(episode)
                      }
                    }}
                    onMouseEnter={() => setHoveredEpisode(index)}
                    onMouseLeave={() => setHoveredEpisode(null)}
                    onFocus={() => setHoveredEpisode(index)}
                      onBlur={() => setHoveredEpisode(null)}
                      tabIndex={0}
                    >
                      <div className="episode-image-wrap">
                        <img src={episode.image} alt={episode.title} />
                      </div>
                      <div className="episode-meta">
                        <p className="episode-time">{episode.time}</p>
                        <p className="episode-tag">{episode.tag}</p>
                      </div>
                      <h2>{episode.title}</h2>
                      <p className="episode-note">{episode.note}</p>
                    </article>
                  )
                })}
              </div>
              <div className="memory-progress">Chapter {activeEpisode + 1} / {episodes.length}</div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export default Home
