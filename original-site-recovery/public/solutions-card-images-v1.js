(() => {
  const protectionImage = "/assets/protection-original-v1.png";

  function restoreSolutionCardImages() {
    const protectionCard = [...document.querySelectorAll(".cards .card")].find(
      (card) => card.querySelector("h3")?.textContent.trim() === "Protection & Legacy",
    );
    const image = protectionCard?.querySelector("img");
    if (!image || image.dataset.restoredProtectionImage === "true") return;

    image.src = protectionImage;
    image.alt = "Protection & Legacy";
    image.dataset.restoredProtectionImage = "true";
  }

  restoreSolutionCardImages();
  new MutationObserver(restoreSolutionCardImages).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
