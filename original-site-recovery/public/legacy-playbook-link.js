(() => {
  const destination = "https://legacyplaybook.wattsunified.com/";

  const connectLegacyPlaybook = () => {
    document
      .querySelectorAll('a[href="/build-wealth-legacy"]')
      .forEach((link) => {
        link.href = destination;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectLegacyPlaybook, {
      once: true,
    });
  } else {
    connectLegacyPlaybook();
  }
})();
