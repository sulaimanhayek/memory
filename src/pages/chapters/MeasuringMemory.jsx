function MeasuringMemory() {
  return (
    <article className="post-page">
      <header className="post-header">
        <h1>Chapter 6: Online Behavioural Study</h1>
        <p className="post-meta">Sulaiman Ahmed &middot; August 15, 2025</p>
        <div className="post-categories">
          <span className="blog-category">study</span>
          <span className="blog-category">behavioural</span>
        </div>
      </header>
      <div className="post-content">
        <p>Laboratory studies of memory, while tightly controlled, often lack ecological validity. Real-world remembering is messy, context-dependent, and influenced by factors that are difficult to replicate in a scanner. This chapter describes the online behavioural study designed to validate and extend the neuroimaging findings.</p>
        <p>A large sample of participants viewed the same naturalistic video stimuli used in the fMRI experiment and completed a series of recall and recognition tasks via a custom web-based platform. The online format allowed us to recruit a diverse sample and collect data at a scale that would not be feasible in a neuroimaging setting.</p>
        <p>We measured several dimensions of memory performance, including the number of events recalled, the order in which they were reported, the level of detail provided, and the accuracy of temporal judgements. These behavioural measures were then related to the computational event boundaries and neural activity patterns described in earlier chapters.</p>
        <p>The results reveal consistent patterns across the lab and online settings: events bounded by model-identified boundaries are recalled more frequently and with greater temporal precision. This convergence across methods strengthens the claim that event segmentation plays a fundamental role in shaping what and how we remember.</p>
      </div>
    </article>
  )
}

export default MeasuringMemory
