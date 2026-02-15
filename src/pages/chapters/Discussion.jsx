function Discussion() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 7: Discussion</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; October 1, 2025</p>
        <div className="post-categories">
          <span className="blog-category">discussion</span>
          <span className="blog-category">conclusion</span>
        </div>
      </header>
      <div className="post-content">
        <p>This project set out to investigate episodic memory through the lens of event segmentation, combining computational modelling, neuroimaging, and behavioural experimentation. Across the preceding chapters, we have shown that the way continuous experience is parsed into discrete events has profound consequences for what is subsequently remembered.</p>
        <p>The CNN model demonstrated that low-level visual features can account for a significant proportion of human segmentation behaviour, while the Perception Census model revealed the additional contribution of higher-order perceptual dimensions. Together, these models provide complementary perspectives on the mechanisms underlying event boundary detection.</p>
        <p>The fMRI data confirmed that event boundaries elicit distinct neural signatures, particularly in the hippocampus and posterior medial cortex, and that the strength of these signals predicts subsequent recall. The online behavioural study replicated these patterns at scale, demonstrating the robustness of the findings across laboratory and naturalistic settings.</p>
        <p>Several open questions remain. How do individual differences in event segmentation relate to broader cognitive abilities? Can the models developed here generalise to other types of naturalistic stimuli? And how might these findings inform interventions for populations with memory impairments? These questions represent promising directions for future research and underscore the value of an interdisciplinary approach to understanding human memory.</p>
      </div>
    </article>
  )
}

export default Discussion
