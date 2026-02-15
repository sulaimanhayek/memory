function SegmentingExperience() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 2: Event Segmentation</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; July 15, 2025</p>
        <div className="post-categories">
          <span className="blog-category">methods</span>
          <span className="blog-category">analysis</span>
        </div>
      </header>
      <div className="post-content">
        <p>Our conscious experience unfolds as a continuous stream, yet we remember life as a series of discrete episodes. How does the brain carve this seamless flow into meaningful units? Event segmentation theory proposes that the perceptual system automatically detects boundaries — moments of significant change — and uses these to structure memory.</p>
        <p>In this chapter, we examine how computational models can be used to segment naturalistic video stimuli into events that align with human perception. By applying deep learning architectures to continuous video data, we can identify candidate event boundaries and compare them to those reported by human observers.</p>
        <p>We describe the specific models employed in this project, including temporal convolutional networks and transformer-based architectures, and detail how their outputs are mapped onto behavioural segmentation data. The agreement — and disagreement — between model and human boundaries provides insight into which features of the sensory stream are most salient for memory encoding.</p>
        <p>Understanding event segmentation is critical because it determines the grain at which memories are stored. Finer segmentation may lead to richer recall, while coarser segmentation may produce more schematic representations. The balance between these extremes is a central question of this research.</p>
      </div>
    </article>
  )
}

export default SegmentingExperience
