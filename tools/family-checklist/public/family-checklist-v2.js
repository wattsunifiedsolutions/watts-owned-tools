const leadForm = document.querySelector("#leadForm");
const checklist = document.querySelector("#checklist");
const checklistBoxes = [...document.querySelectorAll("#checklist input[type='checkbox']")];
const completedCount = document.querySelector("#completedCount");
const progressBar = document.querySelector("#progressBar");
const readinessLabel = document.querySelector("#readinessLabel");

function updateProgress() {
  const completed = checklistBoxes.filter((box) => box.checked).length;
  const percent = Math.round((completed / checklistBoxes.length) * 100);
  completedCount.textContent = completed;
  progressBar.style.width = `${percent}%`;
  readinessLabel.textContent = completed === 20
    ? "Excellent foundation"
    : completed >= 15
      ? "Strong plan with a few gaps"
      : completed >= 9
        ? "Good start—several gaps remain"
        : completed > 0
          ? "Important gaps need attention"
          : "Start your review";
}

leadForm.addEventListener("submit", () => {
  if (!leadForm.reportValidity()) return;
  checklist.hidden = false;
  window.setTimeout(() => checklist.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
});

checklistBoxes.forEach((box) => box.addEventListener("change", updateProgress));

document.querySelector("#resetChecklist").addEventListener("click", () => {
  checklistBoxes.forEach((box) => { box.checked = false; });
  updateProgress();
  checklist.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#printChecklist").addEventListener("click", () => window.print());

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.parentElement.querySelector("div");
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    button.querySelector("span:last-child").textContent = open ? "+" : "−";
    panel.hidden = open;
  });
});

updateProgress();
