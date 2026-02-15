function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <div className="about-image">
          <img src="/pixels.png" alt="Pixels" />
        </div>
        <h1>About</h1>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="about-github-link"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Github
        </a>
      </div>
      <div className="about-content">
        <p className="hero-about">
          People remember episodes of experience from their life, known as episodic memory. In recent decades, substantial progress has been made on understanding the basic components of how humans might <em>do</em> episodic memory. There are some recent papers proposing computational models that could potentially work on the scale required to replicate many of the aspects of human episodic memory. These kinds of efforts focus on building cognitive models, with components/configurations informed by what we know from human cognitive psychology and neuroscience. But an alternative approach would be to care less about how brains might do it, and more about what kind of situations/stimulations result in humans remembering something. This research project focuses on what specific aspects of experiences are most memorable to people. By examining both natural outdoor and controlled indoor settings through video stimuli, we can better understand the relationship between environmental context and memory formation. This approach allows us to explore not just the theoretical underpinnings of episodic memory, but its practical manifestations in everyday scenarios.
        </p>
      </div>
    </div>
  )
}

export default About
