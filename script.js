(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.section-intro, .work-card, .approach-mark, .approach > div:not(.approach-mark), .approach-copy, .contact');
  revealTargets.forEach((element, index) => {
    element.dataset.reveal = '';
    element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`);
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach((element) => observer.observe(element));
})();
