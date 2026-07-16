const state = {
  marital: "Single",
  children: "0",
  home: "Renting",
  priority: "Replace monthly income",
  vehicles: [],
  savingEnough: "No",
  outliveSavings: "Yes",
  coverage: "No",
  estatePlan: "No",
};

const byId = (id) => document.getElementById(id);

function scoreState() {
  let score = 28;
  const gaps = [];

  const incomeScore = Number(byId("incomeRange").value);
  const savingsScore = Number(byId("monthlySavings").value);

  score += incomeScore * 6;
  score += savingsScore * 8;

  if (state.marital === "Married") score += 5;
  if (state.children !== "0") {
    score -= 4;
    gaps.push(["Family protection", "Needs review"]);
  }
  if (state.home === "Own Home") score += 5;
  if (state.home === "Renting") gaps.push(["Housing foundation", "Build plan"]);

  if (state.vehicles.length >= 3) score += 12;
  if (state.vehicles.includes("None")) {
    score -= 8;
    gaps.push(["Retirement savings", "No vehicles selected"]);
  }
  if (!state.vehicles.includes("Roth IRA")) gaps.push(["Tax diversification", "Possible gap"]);
  if (!state.vehicles.includes("Annuities")) gaps.push(["Protected income", "Review options"]);

  if (state.savingEnough === "Yes") score += 8;
  else gaps.push(["Savings pace", "Below comfort level"]);

  if (state.outliveSavings === "Yes") {
    score -= 8;
    gaps.push(["Lifetime income", "Concern flagged"]);
  } else {
    score += 4;
  }

  if (state.coverage === "Yes") score += 8;
  else gaps.push(["Life insurance", "Coverage gap"]);

  if (state.estatePlan === "Yes") score += 8;
  else gaps.push(["Estate plan", "Not confirmed"]);

  if (state.priority.includes("debt")) gaps.push(["Debt strategy", "Primary focus"]);
  if (state.priority.includes("education")) gaps.push(["Education funding", "Primary focus"]);

  score = Math.max(0, Math.min(100, score));
  return { score, gaps: gaps.slice(0, 6) };
}

function labelFor(score) {
  if (score >= 78) return "Strong foundation";
  if (score >= 58) return "Needs refinement";
  return "Needs attention";
}

function insightFor(score) {
  if (score >= 78) return "Your foundation looks stronger. The next step is tightening tax efficiency, protected income, and legacy details.";
  if (score >= 58) return "You have pieces in place, but several planning areas need coordination before a major decision.";
  return "Your answers show multiple planning gaps. Start with protection, cash flow, and retirement confidence before adding complexity.";
}

function updateSummary({ score, gaps }) {
  const label = labelFor(score);
  const insight = insightFor(score);
  const meter = byId("scoreMeter");

  byId("readinessScore").textContent = score;
  byId("readinessLabel").textContent = label;
  byId("scoreInsight").textContent = insight;
  byId("resultScore").textContent = score;
  byId("resultLabel").textContent = label;
  byId("resultSummary").textContent = insight;

  meter.style.width = `${score}%`;
  meter.style.background = score >= 78 ? "var(--green)" : score >= 58 ? "var(--gold)" : "var(--red)";

  byId("gapList").innerHTML = (gaps.length ? gaps : [["Foundation", "No major gap flagged yet"]])
    .map(([name, status]) => `<div class="gap-item ${status.includes("No major") ? "ok" : ""}"><span>${name}</span><strong>${status}</strong></div>`)
    .join("");

  if (score >= 78) {
    byId("recommendationTitle").textContent = "Optimize what is already working.";
    byId("recommendationCopy").textContent =
      "Focus the review on tax efficiency, guaranteed income choices, and whether your estate documents match the financial plan.";
  } else if (score >= 58) {
    byId("recommendationTitle").textContent = "Coordinate the pieces before they drift.";
    byId("recommendationCopy").textContent =
      "Your review should connect retirement savings, protection, debt, and legacy decisions into one clear order of operations.";
  } else {
    byId("recommendationTitle").textContent = "Start with the gaps that can hurt first.";
    byId("recommendationCopy").textContent =
      "Your next conversation should prioritize protection, savings pace, lifetime income, and family risk before advanced strategies.";
  }

  byId("snapshotSummary").value = [
    `Readiness score: ${score} (${label})`,
    `Marital status: ${state.marital}`,
    `Children under 18: ${state.children}`,
    `Home status: ${state.home}`,
    `Priority: ${state.priority}`,
    `Savings vehicles: ${state.vehicles.join(", ") || "None selected"}`,
    `Saving enough: ${state.savingEnough}`,
    `Concerned about outliving savings: ${state.outliveSavings}`,
    `Life insurance: ${state.coverage}`,
    `Estate plan: ${state.estatePlan}`,
    `Flagged gaps: ${gaps.map(([name, status]) => `${name} - ${status}`).join("; ") || "None"}`,
  ].join("\n");
}

function update() {
  updateSummary(scoreState());
}

document.querySelectorAll(".choice-grid").forEach((group) => {
  const field = group.dataset.field;
  const isMulti = group.classList.contains("multi");

  group.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.value;
      if (isMulti) {
        if (value === "None") {
          state[field] = button.classList.contains("active") ? [] : ["None"];
        } else {
          state[field] = state[field].filter((item) => item !== "None");
          state[field] = state[field].includes(value)
            ? state[field].filter((item) => item !== value)
            : [...state[field], value];
        }
        group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", state[field].includes(item.dataset.value)));
      } else {
        state[field] = value;
        group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
      }
      update();
    });
  });

  const current = state[field];
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", Array.isArray(current) ? current.includes(button.dataset.value) : current === button.dataset.value);
  });
});

["incomeRange", "monthlySavings"].forEach((id) => byId(id).addEventListener("change", update));

update();
