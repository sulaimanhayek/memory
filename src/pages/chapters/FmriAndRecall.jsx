function FmriAndRecall() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 5: fMRI-Based Model of Event Segmentation</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; August 1, 2025</p>
        <div className="post-categories">
          <span className="blog-category">fMRI</span>
          <span className="blog-category">neuroscience</span>
        </div>
      </header>
      <div className="post-content">
        <p>Functional magnetic resonance imaging (fMRI) offers a window into the brain's activity during both the encoding and retrieval of memories. By measuring blood-oxygen-level-dependent (BOLD) signals, we can identify which regions of the brain are engaged when participants watch naturalistic video scenes and later recall them.</p>
        <p>This chapter presents the neuroimaging component of the project. Participants underwent fMRI scanning while viewing a set of carefully selected video clips depicting everyday activities. Following a delay, they were asked to freely recall the content of the videos while still in the scanner.</p>
        <p>Preliminary analyses reveal that patterns of hippocampal activity during encoding are predictive of subsequent recall success. Moreover, the reinstatement of encoding patterns during retrieval — a phenomenon known as neural reinstatement — is stronger for events that were recalled with greater detail and accuracy.</p>
        <p>We also explore how activity at model-identified event boundaries differs from activity during the middle of events, and whether boundary-related neural signatures predict which events are most likely to be remembered. These findings bridge the computational and neural levels of analysis in this project.</p>
      </div>
    </article>
  )
}

export default FmriAndRecall
