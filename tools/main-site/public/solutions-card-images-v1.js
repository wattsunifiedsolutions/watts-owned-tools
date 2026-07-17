(() => {
  const protectionImage = "/assets/protection-card.webp";

  function restoreSolutionCardImages() {
    const protectionCard = [...document.querySelectorAll(".cards .card")].find(
      (card) => card.querySelector("h3")?.textContent.trim() === "Protection & Legacy",
    );
    const image = protectionCard?.querySelector("img");
    if (!image || image.dataset.restoredProtectionImage === "true") return;

    image.src = protectionImage;
    image.alt = "Black family protected through legacy planning";
    image.dataset.restoredProtectionImage = "true";
  }

  restoreSolutionCardImages();
  new MutationObserver(restoreSolutionCardImages).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
