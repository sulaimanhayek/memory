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
  const [currentQuote] = useState(() => Math.floor(Math.random() * quotes.length))
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(true)
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
  const scrollTargetRef = useRef(0)
  const smoothProgressRef = useRef(0)

  // Fade in the first quote on mount
  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [done])

  const dismiss = useCallback(() => {
    if (transitioning.current || done) return
    transitioning.current = true
    setVisible(false)
    setTimeout(() => {
      setDone(true)
      sessionStorage.setItem('introSeen', 'true')
      transitioning.current = false
    }, 800)
  }, [done])

  // Dismiss on scroll or swipe
  useEffect(() => {
    if (done) return

    const handleWheel = (e) => {
      e.preventDefault()
      if (e.deltaY > 0) dismiss()
    }

    let touchStartY = 0
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const handleTouchEnd = (e) => {
      if (touchStartY - e.changedTouches[0].clientY > 30) dismiss()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [done, dismiss])

  useEffect(() => {
    let rafId = 0

    const updateTarget = () => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        scrollTargetRef.current = 0
        return
      }
      const raw = -rect.top / scrollable
      scrollTargetRef.current = Math.max(0, Math.min(1, raw))
    }

    const animate = () => {
      const target = scrollTargetRef.current
      const current = smoothProgressRef.current
      const diff = target - current

      if (Math.abs(diff) > 0.0001) {
        smoothProgressRef.current += diff * 0.12
        setScrollProgress(smoothProgressRef.current)
      }

      rafId = requestAnimationFrame(animate)
    }

    const onScroll = () => {
      setHoveredEpisode(null)
      updateTarget()
    }

    updateTarget()
    smoothProgressRef.current = scrollTargetRef.current
    setScrollProgress(scrollTargetRef.current)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
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

  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const getEpisodeStyle = (index) => {
    const distance = index - activeFloat
    const absDistance = Math.abs(distance)
    const hoverLift = hoveredEpisode === index ? 1 : 0
    const hoverShiftX = hoverLift ? (distance < 0 ? 10 : -10) : 0

    // Eased transition: 0 = still in future stack, 1 = fully in past pile
    const rawTransition = Math.min(1, Math.max(0, -distance))
    const transition = easeInOutCubic(rawTransition)

    if (isPhone) {
      const stackAnchorX = 12
      const stackAnchorY = -174
      const futureStepY = 15
      const bottomPileX = -84
      const bottomPileY = 128
      const pileOffsetX = Math.min(index, 7) * 4
      const pileOffsetY = Math.min(index, 7) * 10
      const hoverShiftY = hoverLift ? (distance < 0 ? -10 : 8) : 0
      const arcY = Math.sin(transition * Math.PI) * -20

      const passedX = stackAnchorX + (bottomPileX + pileOffsetX - stackAnchorX) * transition
      const passedY = stackAnchorY + (bottomPileY + pileOffsetY - stackAnchorY) * transition + arcY

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
      const rotateY = distance < 0 ? -2 : -4 + distance * 0.15
      const rotateX = 3
      const rotateZ = distance < 0 ? -1 : distance * 0.1
      const zIndex = Math.round(240 - absDistance * 8 + hoverLift * 40)

      return {
        transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        opacity,
        zIndex,
      }
    }

    // Step sizes per card in each stack
    const stepX = 18
    const stepY = -8
    const stepZ = 36
    // Right stack needs wider gaps to compensate for perspective compression
    const futureStepX = 28
    const futureStepY = -12

    // Right stack anchor (future cards) and left pile anchor (past cards)
    const stackAnchorX = 440
    const stackY = -150
    const leftPileX = -480
    const leftPileY = 180

    // Pile offsets: inverted so oldest card (back) peeks RIGHT, newest (front) is leftmost
    const maxIdx = episodes.length - 1
    const depthSlot = maxIdx - Math.min(index, maxIdx)
    const pileOffsetX = depthSlot * stepX
    const pileOffsetY = depthSlot * stepY
    const arcY = Math.sin(transition * Math.PI) * -30

    const passedX = stackAnchorX + (leftPileX + pileOffsetX - stackAnchorX) * transition
    const passedY = stackY + (leftPileY + pileOffsetY - stackY) * transition + arcY

    const translateY = distance < 0
      ? passedY - hoverLift * 18
      : stackY + distance * futureStepY - hoverLift * 18

    const translateX = distance < 0
      ? passedX + hoverShiftX
      : stackAnchorX + distance * futureStepX + hoverShiftX

    const translateZ = distance < 0
      ? -absDistance * stepZ + hoverLift * 60
      : -absDistance * 50 + hoverLift * 60

    const scale = Math.max(0.88, 1 - absDistance * 0.016) + hoverLift * 0.04

    const opacity = Math.max(0.24, 1 - absDistance * 0.06)
    // Consistent rotateY for all cards — always pointing left like books on a shelf
    const rotateY = -40
    const rotateX = 6
    const rotateZ = 0
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
