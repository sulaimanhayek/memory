import { Link } from 'react-router-dom'

const chapters = [
  {
    title: 'Chapter 1: Introduction',
    author: 'Sulaiman Ahmed',
    date: '2025-07-01',
    categories: ['theory', 'neuroscience'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/introduction',
  },
  {
    title: 'Chapter 2: Event Segmentation',
    author: 'Sulaiman Ahmed',
    date: '2025-07-15',
    categories: ['methods', 'analysis'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/event-segmentation',
  },
  {
    title: 'Chapter 3: CNN Model',
    author: 'Sulaiman Ahmed',
    date: '2025-08-01',
    categories: ['deep learning', 'modelling'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/cnn-model',
  },
  {
    title: 'Chapter 4: Perception Census Model',
    author: 'Sulaiman Ahmed',
    date: '2025-08-15',
    categories: ['perception', 'modelling'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/perception-census-model',
  },
  {
    title: 'Chapter 5: fMRI-Based Model of Event Segmentation',
    author: 'Sulaiman Ahmed',
    date: '2025-09-01',
    categories: ['fMRI', 'neuroscience'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/fmri-model',
  },
  {
    title: 'Chapter 6: Online Behavioural Study',
    author: 'Sulaiman Ahmed',
    date: '2025-09-15',
    categories: ['study', 'behavioural'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/online-behavioural-study',
  },
  {
    title: 'Chapter 7: Discussion',
    author: 'Sulaiman Ahmed',
    date: '2025-10-01',
    categories: ['discussion', 'conclusion'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/chapters/discussion',
  },
]

function Blog() {
  return (
    <div className="blog-page">
      <h1>Chapters</h1>
      <div className="blog-grid">
        {chapters.map((ch) => (
          <Link to={ch.slug} key={ch.slug} className="blog-card">
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
