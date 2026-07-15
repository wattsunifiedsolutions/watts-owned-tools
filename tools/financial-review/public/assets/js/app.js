"use strict";

const bookingUrl = "https://calendar.app.google/yKhj6hhTuujzFePt9";
const storageKey = "wusFinancialReview:v1";

const steps = [
  "Personal Profile",
  "Cash Flow",
  "Financial Foundation",
  "Financial Goals",
  "Your Financial Snapshot",
  "Schedule Session"
];

const stepHelp = [
  ["About This Review", "This tool collects organized information before your meeting. It does not provide advice or replace a personal strategy conversation."],
  ["About Cash Flow", "This section helps organize monthly income and expenses. It is not a debt roadmap or recommendation engine."],
  ["About Financial Foundation", "This section identifies financial foundation items that may already be in place before your strategy session."],
  ["About Goals", "Your selected goals help guide the conversation during your Financial Strategy Session."],
  ["Financial Snapshot", "This is a clean summary of entered information only. It is not a recommendation or product suggestion."],
  ["Schedule Your Session", "Your Financial Strategy Session is where your information is reviewed and strategy is discussed."]
];

const expenseGroups = {
  essentials: [
    ["Mortgage / Rent", "mortgageRent"],
    ["Utilities", "utilities"],
    ["Cable / WiFi", "cableWifi"],
    ["Car Payment", "carPayment"],
    ["Car Insurance", "carInsurance"],
    ["Life Insurance", "lifeInsuranceExpense"],
    ["Health Insurance", "healthInsurance"],
    ["Phone", "phoneExpense"],
    ["Groceries", "groceries"],
    ["Gas / Transportation", "transportation"],
    ["Medical / Prescriptions", "medical"],
    ["Childcare", "childcare"],
    ["Household Supplies", "household"]
  ],
  lifestyle: [
    ["Dining Out", "dining"],
    ["Entertainment", "entertainment"],
    ["Fitness", "fitness"],
    ["Pet Care", "petCare"],
    ["Audible / Kindle", "audibleKindle"],
    ["Subscriptions", "subscriptions"],
    ["Beauty / Barber", "beautyBarber"],
    ["Supplements", "supplements"],
    ["Clothing", "clothing"]
  ],
  discretionary: [
    ["Travel", "travel"],
    ["Gifts / Giving", "giving"],
    ["Shopping", "shopping"],
    ["Hobbies", "hobbies"],
    ["Other Discretionary", "otherDiscretionary"]
  ],
  business: [
    ["Business Tools", "businessTools"],
    ["Marketing", "marketing"],
    ["Professional Services", "professionalServices"],
    ["Education / Training", "education"],
    ["Other Business", "otherBusiness"]
  ]
};

const foundationItems = [
  ["Savings", ["Emergency Fund", "Savings Account"]],
  ["Protection", ["Life Insurance", "Disability Coverage", "Employer Life Only", "Beneficiaries Reviewed"]],
  ["Retirement", ["Employer Plan", "IRA", "TSP", "Pension"]],
  ["Estate Planning", ["Will", "Trust", "Power of Attorney", "Healthcare Directive"]]
];

const goals = [
  ["Build Wealth", "Long-term financial growth"],
  ["Become Debt Free", "Review debt and cash flow"],
  ["Protect My Family", "Coverage and family protection"],
  ["Retirement Planning", "Income, savings, and strategy"],
  ["Estate Planning", "Wills, trusts, POA"],
  ["Save for Children or Grandchildren", "Legacy foundation"],
  ["Reduce Taxes", "Tax-efficient structure"],
  ["Business Planning", "Protection and continuity"],
  ["Review Current Strategy", "Second look at existing plan"]
];

let current = 0;
let restoreMode = false;
let toastTimer;

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const money = value => Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const clean = value => String(value || "").trim();
const getNumber = id => Number(document.getElementById(id)?.value || 0);
const getText = id => clean(document.getElementById(id)?.value);
const selected = name => $$(`input[name="${name}"]:checked`).map(input => input.value);
const escapeHtml = value => clean(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));

function field(id, label, attrs = "") {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" ${attrs} aria-describedby="${id}Error">
      <div class="field-error" id="${id}Error"></div>
    </div>
  `;
}

function selectField(id, label, options) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <select id="${id}" name="${id}" aria-describedby="${id}Error">
        <option value="">Select one</option>
        ${options.map(option => `<option>${option}</option>`).join("")}
      </select>
      <div class="field-error" id="${id}Error"></div>
    </div>
  `;
}

function expenseRows(rows) {
  return rows.map(([label, id]) => `
    <div class="expense-row">
      <label for="${id}">${label}</label>
      <div class="mini-money"><span aria-hidden="true">$</span><input id="${id}" name="${id}" inputmode="decimal" type="number" min="0" step="0.01" placeholder="0.00"></div>
    </div>
  `).join("");
}

function checkboxList(name, items) {
  return items.map(item => `
    <label class="check-card">
      <input type="checkbox" name="${name}" value="${item}">
      <span>${item}</span>
    </label>
  `).join("");
}

function buildSections() {
  $("#sections").innerHTML = `
    <section class="section active" data-step="0" aria-labelledby="profileTitle">
      <div class="stage">
        <div class="eyebrow">Step 1 of 6</div>
        <h2 id="profileTitle">Personal Profile</h2>
        <p class="lead">Basic household and background information for your review.</p>
        <hr class="rule">
        <div class="grid two">
          ${field("fullName", "Full Name", 'autocomplete="name" placeholder="First and last name" required')}
          ${field("email", "Email Address", 'type="email" autocomplete="email" placeholder="name@email.com" required')}
          ${field("phone", "Phone Number", 'type="tel" autocomplete="tel" placeholder="(555) 555-5555" required')}
          ${selectField("ageRange", "Age Range", ["18-29", "30-39", "40-49", "50-59", "60+"])}
          ${selectField("marital", "Marital Status", ["Single", "Married", "Divorced", "Widowed"])}
          ${field("dependents", "Children / Dependents", 'placeholder="Example: 2 children" required')}
          ${field("occupation", "Occupation", 'autocomplete="organization-title" placeholder="Current occupation" required')}
          ${selectField("clientType", "Background", ["Veteran / Military", "Federal Employee", "Business Owner", "Professional", "Self-Employed", "Retired", "First Responder", "Educator", "Healthcare Professional", "Other"])}
        </div>
        <div class="buttons"><span></span><button class="btn primary" type="button" data-next>Continue</button></div>
      </div>
    </section>

    <section class="section" data-step="1" aria-labelledby="cashFlowTitle">
      <div class="stage">
        <div class="eyebrow">Step 2 of 6</div>
        <h2 id="cashFlowTitle">Cash Flow</h2>
        <p class="lead">Break down income and monthly expenses. This section concludes with a snapshot, not a debt roadmap.</p>
        <hr class="rule">
        <div class="block-title">1. Net Monthly Income</div>
        <p class="block-copy">Enter your total take-home pay each month.</p>
        <div class="field">
          <label for="netIncome">Net Monthly Income</label>
          <div class="money-field"><span aria-hidden="true">$</span><input id="netIncome" name="netIncome" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" aria-describedby="netIncomeError"></div>
          <div class="field-error" id="netIncomeError"></div>
        </div>
        <hr class="rule">
        <div class="block-title">2. Expenses</div>
        <p class="block-copy">Enter your average monthly expenses in each category.</p>
        <div class="expense-layout">
          <div class="expense-card">
            <h3><span class="icon" aria-hidden="true">H</span> Essentials</h3>
            ${expenseRows(expenseGroups.essentials)}
          </div>
          <div class="expense-card">
            <h3><span class="icon" aria-hidden="true">L</span> Lifestyle</h3>
            ${expenseRows(expenseGroups.lifestyle)}
          </div>
          <div>
            <div class="expense-card">
              <h3><span class="icon gold" aria-hidden="true">D</span> Discretionary Spending</h3>
              ${expenseRows(expenseGroups.discretionary)}
            </div>
            <div class="business-toggle">
              <div class="block-title">Are you a business owner?</div>
              <div class="radio-row">
                <label><input type="radio" name="isBusinessOwner" value="Yes"> Yes</label>
                <label><input type="radio" name="isBusinessOwner" value="No" checked> No</label>
              </div>
              <p class="block-copy" style="margin-top:12px;margin-bottom:0;">If yes, additional business expense categories will appear.</p>
            </div>
            <div class="expense-card" id="businessExpenses" hidden style="margin-top:12px;">
              <h3><span class="icon" aria-hidden="true">B</span> Business Owner Expenses</h3>
              ${expenseRows(expenseGroups.business)}
            </div>
          </div>
        </div>
        <div class="snapshot">
          <div class="block-title">3. Monthly Financial Snapshot</div>
          <p class="block-copy">Here is a summary of your income and expenses.</p>
          <div class="snapshot-grid">
            <div class="snap-card income"><span>Net Monthly Income</span><b id="snapIncome">$0</b></div>
            <div class="snap-card expenses"><span>Total Monthly Expenses</span><b id="snapExpenses">$0</b></div>
            <div class="snap-card disposable"><span>Disposable Income</span><b id="snapDisposable">$0</b><small>Income minus expenses</small></div>
          </div>
        </div>
        <div class="buttons"><button class="btn ghost" type="button" data-prev>Back</button><button class="btn primary" type="button" data-next>Continue</button></div>
      </div>
    </section>

    <section class="section" data-step="2" aria-labelledby="foundationTitle">
      <div class="stage">
        <div class="eyebrow">Step 3 of 6</div>
        <h2 id="foundationTitle">Financial Foundation</h2>
        <p class="lead">These questions help organize what is already in place before your Financial Strategy Session.</p>
        <hr class="rule">
        <div class="foundation-grid">
          ${foundationItems.map(([title, items], index) => `
            <div class="foundation-card">
              <div class="foundation-icon" aria-hidden="true">${index + 1}</div>
              <h3>${index + 1}. ${title}</h3>
              <div class="check-list">${checkboxList("foundation", items)}</div>
              ${index === 0 ? `
                <div class="emergency-input">
                  <div class="field">
                    <label for="emergencySavings">Approximate Emergency Savings <span class="optional">(Optional)</span></label>
                    <div class="money-field"><span aria-hidden="true">$</span><input id="emergencySavings" name="emergencySavings" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div>
                  </div>
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
        <div class="buttons"><button class="btn ghost" type="button" data-prev>Back</button><button class="btn primary" type="button" data-next>Continue</button></div>
      </div>
    </section>

    <section class="section" data-step="3" aria-labelledby="goalsTitle">
      <div class="stage">
        <div class="eyebrow">Step 4 of 6</div>
        <h2 id="goalsTitle">Financial Goals</h2>
        <p class="lead">Select the financial goals you would like to review during your Financial Strategy Session.</p>
        <hr class="rule">
        <div class="goals" id="goalsList">
          ${goals.map(([title, sub]) => `
            <label class="goal">
              <input type="checkbox" name="goals" value="${title}">
              <strong>${title}</strong>
              <small>${sub}</small>
            </label>
          `).join("")}
        </div>
        <div class="field-error" id="goalsError"></div>
        <div class="buttons"><button class="btn ghost" type="button" data-prev>Back</button><button class="btn primary" type="button" data-next>View Snapshot</button></div>
      </div>
    </section>

    <section class="section printable" data-step="4" aria-labelledby="summaryTitle">
      <div class="stage">
        <div class="eyebrow">Step 5 of 6</div>
        <h2 id="summaryTitle">Your Financial Snapshot</h2>
        <p class="lead">This is an informational summary of what you entered. Your strategy and next steps are discussed during your session.</p>
        <hr class="rule">
        <div class="summary" id="summary"></div>
        <div class="meeting-card" style="margin-top:18px;">
          <h3>Thank you for completing your Watts Unified Financial Review.</h3>
          <p>During your Financial Strategy Session, you can review your results together and discuss strategies that align with your goals.</p>
        </div>
        <div class="buttons"><button class="btn ghost" type="button" data-prev>Back</button><button class="btn ghost" type="button" id="printSummary">Print / Save Snapshot</button><button class="btn primary" type="button" data-next>Schedule Session</button></div>
      </div>
    </section>

    <section class="section" data-step="5" aria-labelledby="scheduleTitle">
      <div class="stage">
        <div class="eyebrow">Step 6 of 6</div>
        <h2 id="scheduleTitle">Schedule Financial Strategy Session</h2>
        <p class="lead">Use the booking page below to schedule a time to review your Financial Review together.</p>
        <hr class="rule">
        <div class="meeting-card">
          <h3>Financial Strategy Session</h3>
          <p>Your review gives the meeting structure. The strategy conversation happens with Watts Unified Solutions.</p>
          <a class="btn gold" style="margin-top:20px;" href="${bookingUrl}" target="_blank" rel="noopener">Book Financial Strategy Session</a>
        </div>
        <div class="buttons"><button class="btn ghost" type="button" data-prev>Back</button><button class="btn ghost" type="button" id="printSummaryFinal">Print / Save Snapshot</button><button class="btn primary" type="button" id="startOverFinal">Start New Review</button></div>
      </div>
    </section>
  `;
}

function isBusinessOwner() {
  return document.querySelector('input[name="isBusinessOwner"]:checked')?.value === "Yes";
}

function updateBusinessExpenses() {
  const businessBox = $("#businessExpenses");
  if (businessBox) businessBox.hidden = !isBusinessOwner();
}

function calculateCash() {
  const sum = rows => rows.reduce((total, [, id]) => total + getNumber(id), 0);
  const income = getNumber("netIncome");
  const essentials = sum(expenseGroups.essentials);
  const lifestyle = sum(expenseGroups.lifestyle);
  const discretionary = sum(expenseGroups.discretionary);
  const business = isBusinessOwner() ? sum(expenseGroups.business) : 0;
  const expenses = essentials + lifestyle + discretionary + business;
  const disposable = income - expenses;

  $("#snapIncome").textContent = money(income);
  $("#snapExpenses").textContent = money(expenses);
  $("#snapDisposable").textContent = money(disposable);
  return { income, essentials, lifestyle, discretionary, business, expenses, disposable };
}

function setError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}Error`);
  if (!input || !error) return;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  error.textContent = message || "";
}

function validateStep(stepIndex, focusFirst = true) {
  let valid = true;
  const requiredByStep = {
    0: ["fullName", "email", "phone", "ageRange", "marital", "dependents", "occupation", "clientType"],
    1: ["netIncome"]
  };

  (requiredByStep[stepIndex] || []).forEach(id => {
    const input = document.getElementById(id);
    let message = "";
    if (!clean(input?.value)) message = "Please complete this field.";
    if (id === "email" && clean(input?.value) && !input.checkValidity()) message = "Please enter a valid email address.";
    if (id === "netIncome" && Number(input?.value) < 0) message = "Please enter a valid amount.";
    setError(id, message);
    if (message) valid = false;
  });

  if (stepIndex === 3) {
    const message = selected("goals").length ? "" : "Please select at least one goal.";
    $("#goalsError").textContent = message;
    valid = !message;
  }

  if (!valid && focusFirst) {
    const firstInvalid = $("[aria-invalid='true']") || ($("#goalsError").textContent ? $("#goalsList input") : null);
    firstInvalid?.focus();
    showToast("Please complete the highlighted fields before continuing.");
  }
  return valid;
}

function updateGoalSelections() {
  $$(".goal").forEach(label => {
    label.classList.toggle("selected", label.querySelector("input").checked);
  });
  if (selected("goals").length) $("#goalsError").textContent = "";
}

function row(label, value, type = "text") {
  if (value === undefined || value === null || value === "") return "";
  const display = type === "money" ? money(value) : escapeHtml(value);
  if (type === "money" && Number(value) === 0) return "";
  return `<div class="summary-row"><span>${label}</span><b>${display}</b></div>`;
}

function tags(items, emptyText) {
  return `<div class="tags">${items.length ? items.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join("") : `<span class="tag">${emptyText}</span>`}</div>`;
}

function buildSummary() {
  const cash = calculateCash();
  const foundation = selected("foundation");
  const selectedGoals = selected("goals");
  const name = getText("fullName") || "Client";

  $("#summary").innerHTML = `
    <div class="summary-card">
      <h3>${escapeHtml(name)}'s Review Snapshot</h3>
      ${row("Email", getText("email"))}
      ${row("Phone", getText("phone"))}
      ${row("Age Range", getText("ageRange"))}
      ${row("Marital Status", getText("marital"))}
      ${row("Children / Dependents", getText("dependents"))}
      ${row("Occupation", getText("occupation"))}
      ${row("Background", getText("clientType"))}
    </div>

    <div class="summary-card">
      <h3>Monthly Financial Snapshot</h3>
      ${row("Net Monthly Income", cash.income, "money")}
      ${row("Total Monthly Expenses", cash.expenses, "money")}
      ${row("Disposable Income", cash.disposable, "money")}
    </div>

    <div class="summary-card">
      <h3>Expense Breakdown</h3>
      ${row("Essentials", cash.essentials, "money")}
      ${row("Lifestyle", cash.lifestyle, "money")}
      ${row("Discretionary Spending", cash.discretionary, "money")}
      ${isBusinessOwner() ? row("Business Owner Expenses", cash.business, "money") : ""}
    </div>

    <div class="summary-card">
      <h3>Financial Foundation</h3>
      ${tags(foundation, "No foundation items selected")}
      ${row("Approximate Emergency Savings", getNumber("emergencySavings"), "money")}
    </div>

    <div class="summary-card">
      <h3>Goals Selected</h3>
      ${tags(selectedGoals, "No goals selected")}
    </div>
  `;
}

function updateNavigation() {
  $("#progressStep").textContent = `Step ${current + 1} of ${steps.length}`;
  $("#progressDots").innerHTML = steps.map((_, index) => `<span class="dot ${index < current ? "done" : ""} ${index === current ? "active" : ""}">${index + 1}</span>`).join("");
  $("#navSteps").innerHTML = steps.map((step, index) => `
    <button class="navitem ${index < current ? "done" : ""} ${index === current ? "active" : ""}" type="button" data-step-target="${index}" aria-current="${index === current ? "step" : "false"}">
      <span class="navcircle">${index < current ? "✓" : index + 1}</span>
      <span class="navtext"><strong>${step}</strong><span>${index < current ? "Complete" : index === current ? "In Progress" : "Not Started"}</span></span>
    </button>
  `).join("");
  $$("[data-step-target]").forEach(button => {
    button.addEventListener("click", () => goStep(Number(button.dataset.stepTarget)));
  });
  $$(".section").forEach((section, index) => section.classList.toggle("active", index === current));
  $("#sideTitle").textContent = stepHelp[current][0];
  $("#sideCopy").textContent = stepHelp[current][1];
  if (current === 4) buildSummary();
  saveState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goStep(index) {
  const next = Math.max(0, Math.min(steps.length - 1, index));
  if (next > current && !validateStep(current)) return;
  current = next;
  updateNavigation();
}

function collectState() {
  const fields = {};
  $$("input, select").forEach(input => {
    if (input.type === "checkbox") {
      fields[input.name] = fields[input.name] || [];
      if (input.checked) fields[input.name].push(input.value);
    } else if (input.type === "radio") {
      if (input.checked) fields[input.name] = input.value;
    } else {
      fields[input.name || input.id] = input.value;
    }
  });
  return { current, fields, savedAt: new Date().toISOString() };
}

function saveState() {
  if (restoreMode) return;
  localStorage.setItem(storageKey, JSON.stringify(collectState()));
  $("#resumeNotice").hidden = false;
}

function applyState(state) {
  restoreMode = true;
  Object.entries(state.fields || {}).forEach(([name, value]) => {
    const inputs = $$(`[name="${CSS.escape(name)}"]`);
    inputs.forEach(input => {
      if (input.type === "checkbox") input.checked = Array.isArray(value) && value.includes(input.value);
      else if (input.type === "radio") input.checked = input.value === value;
      else input.value = value;
    });
  });
  current = Number.isInteger(state.current) ? state.current : 0;
  restoreMode = false;
  updateBusinessExpenses();
  updateGoalSelections();
  calculateCash();
  updateNavigation();
}

function clearReview() {
  localStorage.removeItem(storageKey);
  $("#reviewForm").reset();
  current = 0;
  updateBusinessExpenses();
  updateGoalSelections();
  calculateCash();
  updateNavigation();
  $("#resumeNotice").hidden = true;
  showToast("Started a new review.");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function wireEvents() {
  $$("[data-next]").forEach(button => {
    button.addEventListener("click", () => goStep(current + 1));
  });

  $$("[data-prev]").forEach(button => {
    button.addEventListener("click", () => goStep(current - 1));
  });

  $("#reviewForm").addEventListener("input", event => {
    if (event.target.matches("input, select")) {
      if (event.target.id) setError(event.target.id, "");
      updateBusinessExpenses();
      updateGoalSelections();
      calculateCash();
      saveState();
    }
  });

  $("#reviewForm").addEventListener("change", event => {
    if (event.target.matches("input, select")) {
      updateBusinessExpenses();
      updateGoalSelections();
      calculateCash();
      saveState();
    }
  });

  $("#printSummary").addEventListener("click", () => {
    buildSummary();
    window.print();
  });
  $("#printSummaryFinal").addEventListener("click", () => {
    buildSummary();
    current = 4;
    updateNavigation();
    window.setTimeout(() => window.print(), 50);
  });
  $("#startOverFinal").addEventListener("click", clearReview);
  $("#clearReviewInline").addEventListener("click", clearReview);
  $("#startNewReview").addEventListener("click", () => {
    $("#startOverlay").hidden = true;
    clearReview();
  });
  $("#continueReview").addEventListener("click", () => {
    $("#startOverlay").hidden = true;
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    applyState(saved);
    showToast("Previous review restored.");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

function init() {
  buildSections();
  wireEvents();
  updateBusinessExpenses();
  updateGoalSelections();
  calculateCash();

  const savedRaw = localStorage.getItem(storageKey);
  if (savedRaw) {
    $("#startOverlay").hidden = false;
    $("#resumeNotice").hidden = false;
  } else {
    restoreMode = true;
    updateNavigation();
    restoreMode = false;
    $("#resumeNotice").hidden = true;
  }

  registerServiceWorker();
}

init();
