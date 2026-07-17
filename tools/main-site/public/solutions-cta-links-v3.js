(() => {
  const destinations = new Map([
    ["Retirement & Wealth", "https://wattsunified.com/solutions/retirement-wealth"],
    ["Protection & Legacy", "https://wattsunified.com/solutions/protection-legacy"],
    ["Veteran Guidance", "https://wattsunified.com/veteran-roadmap"],
    ["Life Insurance Strategy", "https://wattsunified.com/solutions/life-insurance"],
    ["Business Solutions", "https://wattsunified.com/solutions/business"],
    ["Estate & Trust Planning", "https://wattsunified.com/build-wealth-legacy#legacy"],
  ]);

  function wireSolutionCards() {
    document.querySelectorAll(".cards .card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent.trim();
      const destination = destinations.get(title);
      const link = card.querySelector("a.text-link");
      if (!destination || !link) return;
      link.href = destination;
      link.dataset.designatedSolutionUrl = destination;
      link.setAttribute("aria-label", `${link.textContent.trim()} — ${title}`);
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-designated-solution-url]");
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(link.dataset.designatedSolutionUrl);
  }, true);

  wireSolutionCards();
  new MutationObserver(wireSolutionCards).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
