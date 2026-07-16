const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const monthlyMoney = (value) => `${money.format(value)}/mo`;
const byId = (id) => document.getElementById(id);

const ids = [
  "currentAge",
  "retirementAge",
  "annualIncome",
  "currentSavings",
  "contributionRate",
  "growthRate",
  "futureTaxRate",
  "taxDrag",
  "withdrawalRate",
  "taxableShare",
  "deferredShare",
];

function value(id) {
  return Number(byId(id).value) || 0;
}

function futureValue(principal, annualContribution, rate, years) {
  let balance = principal;
  for (let year = 0; year < years; year += 1) {
    balance = (balance + annualContribution) * (1 + rate);
  }
  return balance;
}

function normalizeAllocations() {
  let taxable = value("taxableShare");
  let deferred = value("deferredShare");
  if (taxable + deferred > 100) {
    deferred = 100 - taxable;
    byId("deferredShare").value = deferred;
  }
  const taxFree = Math.max(0, 100 - taxable - deferred);
  byId("taxableShareValue").textContent = `${taxable}%`;
  byId("deferredShareValue").textContent = `${deferred}%`;
  byId("taxFreeShare").textContent = `Tax-advantaged allocation: ${taxFree}%`;
  return { taxable, deferred, taxFree };
}

function drawBars(results) {
  const max = Math.max(results.taxableIncome, results.deferredIncome, results.advantagedIncome, 1);
  const rows = [
    ["Tax Now", results.taxableIncome],
    ["Tax Later", results.deferredIncome],
    ["Tax-Advantaged", results.advantagedIncome],
  ];

  byId("barChart").innerHTML = rows
    .map(([label, amount]) => {
      const width = Math.max(3, Math.round((amount / max) * 100));
      return `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
          <strong>${monthlyMoney(amount)}</strong>
        </div>
      `;
    })
    .join("");
}

function updateRecommendation(results) {
  const gap = results.advantagedIncome - results.deferredIncome;
  const title = byId("recommendationTitle");
  const copy = byId("recommendationCopy");

  if (gap > 2500) {
    title.textContent = "Your tax exposure is doing real damage.";
    copy.textContent =
      "The current assumptions show a large spendable-income gap. This is the point where a tax-free income review matters because future taxes can quietly erase years of saving.";
  } else if (gap > 900) {
    title.textContent = "There is a meaningful tax-bucket opportunity.";
    copy.textContent =
      "The tax-advantaged bucket is showing stronger net monthly income. The next step is seeing which dollars can be repositioned without disrupting liquidity or protection.";
  } else {
    title.textContent = "Your buckets are closer, but the structure still matters.";
    copy.textContent =
      "The gap is modest with these assumptions. A review should focus on liquidity, downside protection, survivor needs, and whether future tax rates may be higher than projected.";
  }
}

function calculate() {
  const currentAge = value("currentAge");
  const retirementAge = Math.max(value("retirementAge"), currentAge + 1);
  byId("retirementAge").value = retirementAge;
  const years = Math.max(1, retirementAge - currentAge);
  const income = value("annualIncome");
  const savings = value("currentSavings");
  const contribution = income * (value("contributionRate") / 100);
  const growth = value("growthRate") / 100;
  const futureTax = value("futureTaxRate") / 100;
  const taxableDrag = value("taxDrag") / 100;
  const incomeRate = value("withdrawalRate") / 100;
  const allocation = normalizeAllocations();

  byId("currentAgeValue").textContent = currentAge;
  byId("retirementAgeValue").textContent = retirementAge;

  const taxableBalance = futureValue(savings, contribution, Math.max(0, growth - taxableDrag), years);
  const deferredBalance = futureValue(savings, contribution, growth, years);
  const advantagedBalance = futureValue(savings, contribution, growth + 0.008, years);
  const currentDeferredBalance = futureValue(
    savings * (allocation.deferred / 100),
    contribution * (allocation.deferred / 100),
    growth,
    years,
  );

  const taxableIncome = (taxableBalance * incomeRate) / 12;
  const deferredGrossIncome = (deferredBalance * incomeRate) / 12;
  const deferredIncome = deferredGrossIncome * (1 - futureTax);
  const advantagedIncome = (advantagedBalance * Math.max(incomeRate, 0.06)) / 12;
  const taxExposure = currentDeferredBalance * futureTax;
  const floorBenefit = deferredBalance * 0.18;
  const incomeGap = advantagedIncome - deferredIncome;

  const results = {
    taxableIncome,
    deferredIncome,
    advantagedIncome,
  };

  byId("taxableIncome").textContent = monthlyMoney(taxableIncome);
  byId("taxableBalance").textContent = `${money.format(taxableBalance)} projected`;
  byId("deferredIncome").textContent = monthlyMoney(deferredIncome);
  byId("heroDeferred").textContent = monthlyMoney(deferredIncome);
  byId("deferredTax").textContent = `${money.format(taxExposure)} future tax exposure`;
  byId("advantagedIncome").textContent = monthlyMoney(advantagedIncome);
  byId("heroAdvantaged").textContent = monthlyMoney(advantagedIncome);
  byId("incomeGap").textContent = `${monthlyMoney(Math.max(0, incomeGap))} improvement`;
  byId("heroGap").textContent = monthlyMoney(Math.max(0, incomeGap));
  byId("yearsToRetirement").textContent = years;
  byId("annualContribution").textContent = money.format(contribution);
  byId("taxExposure").textContent = money.format(taxExposure);
  byId("floorBenefit").textContent = money.format(floorBenefit);

  drawBars(results);
  updateRecommendation({ ...results, deferredIncome, advantagedIncome });
}

ids.forEach((id) => byId(id).addEventListener("input", calculate));
calculate();
