import { Link } from 'react-router-dom'

const posts = [
  {
    title: 'Welcome To My Blog',
    author: 'Tristan O\'Malley',
    date: '2025-06-02',
    categories: ['news'],
    image: '/posts/welcome/thumbnail.jpg',
    slug: '/posts/welcome',
  },
  {
    title: 'Post With Code',
    author: 'Harlow Malloc',
    date: '2025-06-05',
    categories: ['news', 'code', 'analysis'],
    image: '/posts/post-with-code/image.jpg',
    slug: '/posts/post-with-code',
  },
]

function Blog() {
  return (
    <div className="blog-page">
      <h1>Blog</h1>
      <div className="blog-grid">
        {posts.map((post) => (
          <Link to={post.slug} key={post.slug} className="blog-card">
            <div className="blog-card-image">
              <img src={post.image} alt={post.title} />
            </div>
            <div className="blog-card-body">
              <h2>{post.title}</h2>
              <p className="blog-card-meta">
                {post.author} &middot; {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="blog-card-categories">
                {post.categories.map((cat) => (
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
