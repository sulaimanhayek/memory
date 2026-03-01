import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import { getChapterBySlug } from '../content/chapters'

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

function extractHeadings(markdown) {
  const headings = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{1,2})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        id: slugify(match[2].trim()),
      })
    }
  }
  return headings
}

function ChapterPage() {
  const { slug } = useParams()
  const chapter = getChapterBySlug(slug)
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef(null)

  useEffect(() => {
    if (!chapter) return

    const headingEls = document.querySelectorAll('.post-content h1[id], .post-content h2[id]')
    if (!headingEls.length) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    headingEls.forEach((el) => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [chapter])

  if (!chapter) {
    return (
      <article className="post-page">
        <header className="post-header">
          <h1>Chapter not found</h1>
        </header>
        <div className="post-content">
          <p>The chapter you're looking for doesn't exist.</p>
        </div>
      </article>
    )
  }

  const headings = extractHeadings(chapter.content)

  const components = {
    h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
    h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
  }

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setActiveId(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="chapter-layout">
      <nav className="chapter-sidebar">
        <ul className="chapter-nav-list">
          {headings.map((h) => (
            <li key={h.id} className={`chapter-nav-item${h.level === 2 ? ' sub' : ''}`}>
              <a
                href={`#${h.id}`}
                className={activeId === h.id ? 'active' : ''}
                onClick={(e) => handleNavClick(e, h.id)}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <article className="post-page">
        <header className="post-header">
          <h1>{chapter.title}</h1>
          <p className="post-meta">
            {chapter.author} &middot;{' '}
            {new Date(chapter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="post-categories">
            {chapter.categories.map((cat) => (
              <span key={cat} className="blog-category">
                {cat}
              </span>
            ))}
          </div>
        </header>
        <div className="post-content">
          <Markdown components={components}>{chapter.content}</Markdown>
        </div>
      </article>
    </div>
  )
}

export default ChapterPage
