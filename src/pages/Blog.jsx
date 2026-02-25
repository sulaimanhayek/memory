import { Link } from 'react-router-dom'
import { chapters } from '../content/chapters'

function Blog() {
  return (
    <div className="blog-page">
      <h1>Chapters</h1>
      <div className="blog-grid">
        {chapters.map((ch) => (
          <Link to={`/chapters/${ch.slug}`} key={ch.slug} className="blog-card">
            <div className="blog-card-image">
              <img src={ch.image} alt={ch.title} />
            </div>
            <div className="blog-card-body">
              <h2>{ch.title}</h2>
              <p className="blog-card-meta">
                {ch.author} &middot; {new Date(ch.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="blog-card-categories">
                {ch.categories.map((cat) => (
                  <span key={cat} className="blog-category">{cat}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Blog
