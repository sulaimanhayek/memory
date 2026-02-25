import { useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { getChapterBySlug } from '../content/chapters'

function ChapterPage() {
  const { slug } = useParams()
  const chapter = getChapterBySlug(slug)

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

  return (
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
        <Markdown>{chapter.content}</Markdown>
      </div>
    </article>
  )
}

export default ChapterPage
