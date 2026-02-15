function PostWithCode() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Post With Code</h1>
        <p className="post-meta">Harlow Malloc &middot; June 5, 2025</p>
        <div className="post-categories">
          <span className="blog-category">news</span>
          <span className="blog-category">code</span>
          <span className="blog-category">analysis</span>
        </div>
      </header>
      <div className="post-content">
        <p>This is a post with executable code.</p>
        <img src="/posts/post-with-code/image.jpg" alt="Post with code" />
      </div>
    </article>
  )
}

export default PostWithCode
