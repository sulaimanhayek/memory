function PerceptionCensusModel() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 4: Perception Census Model</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; August 15, 2025</p>
        <div className="post-categories">
          <span className="blog-category">perception</span>
          <span className="blog-category">modelling</span>
        </div>
      </header>
      <div className="post-content">
        <p>The Perception Census is a large-scale citizen science project that captures the rich diversity of human perceptual experience. By leveraging data from thousands of participants, the Perception Census provides a uniquely broad empirical foundation for modelling how people perceive and segment continuous sensory input.</p>
        <p>In this chapter, we describe a model of event segmentation derived from Perception Census data. Unlike the CNN-based approach, which operates on low-level visual features, this model incorporates higher-order perceptual dimensions — including subjective salience, emotional valence, and attentional engagement — that have been shown to influence how people parse ongoing experience.</p>
        <p>The model is trained on perceptual ratings collected from a diverse population, allowing it to capture systematic individual differences in segmentation behaviour. We show that this model predicts human event boundaries with greater accuracy than the CNN model alone, particularly for boundaries driven by changes in narrative or emotional content rather than purely visual transitions.</p>
        <p>These findings highlight the importance of incorporating subjective perceptual factors into computational models of memory. Event segmentation is not merely a bottom-up visual process — it is shaped by the full richness of perceptual experience.</p>
      </div>
    </article>
  )
}

export default PerceptionCensusModel
