function CnnModel() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 3: CNN Model</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; August 1, 2025</p>
        <div className="post-categories">
          <span className="blog-category">deep learning</span>
          <span className="blog-category">modelling</span>
        </div>
      </header>
      <div className="post-content">
        <p>Convolutional neural networks (CNNs) have become a cornerstone of modern computer vision, and their hierarchical feature representations offer a compelling analogy to the ventral visual stream in the human brain. In this chapter, we describe how a CNN-based model is used to automatically segment continuous video into discrete events.</p>
        <p>The approach relies on extracting frame-level feature representations from a pre-trained deep network and computing the dissimilarity between successive frames. When the representational distance crosses a threshold, the model registers an event boundary — a moment where the visual content has changed sufficiently to warrant a new memory unit.</p>
        <p>We evaluate the model's boundary predictions against human-annotated segmentation data, examining both the precision and recall of detected boundaries. The results indicate that mid-level CNN features, corresponding roughly to object and scene representations, yield the best alignment with human judgements.</p>
        <p>This chapter also discusses the limitations of purely feedforward CNN models for event segmentation, including their insensitivity to temporal context and narrative structure, motivating the exploration of alternative modelling approaches in subsequent chapters.</p>
      </div>
    </article>
  )
}

export default CnnModel
