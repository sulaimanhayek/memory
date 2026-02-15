function Welcome() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Welcome To My Blog</h1>
        <p className="post-meta">Tristan O'Malley &middot; June 2, 2025</p>
        <div className="post-categories">
          <span className="blog-category">news</span>
        </div>
      </header>
      <div className="post-content">
        <p>This is the first post in a Quarto blog. Welcome!</p>
        <img src="/posts/welcome/thumbnail.jpg" alt="Welcome thumbnail" />
        <p>Since this post doesn't specify an explicit <code>image</code>, the first image in the post will be used in the listing page of posts.</p>
      </div>
    </article>
  )
}

export default Welcome
