(() => {
  const replacements = new Map([
    [
      "Sherman A. Watts—Retirement and Legacy Specialist, Army Veteran",
      "/assets/hero-original-v1.webp",
    ],
    ["Wealth & Legacy Strategy", "/assets/wealth-legacy-original-v1.png"],
  ]);

  function restoreHomepageImages() {
    if (window.location.pathname !== "/") return;

    document.querySelectorAll("img").forEach((image) => {
      const replacement = replacements.get(image.alt);
      if (!replacement || image.dataset.originalHomepageImage === replacement) return;
      image.src = replacement;
      image.dataset.originalHomepageImage = replacement;
    });
  }

  restoreHomepageImages();
  new MutationObserver(restoreHomepageImages).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
