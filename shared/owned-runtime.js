(function () {
  "use strict";

  const script = document.currentScript;
  const tool = script?.dataset.tool || location.hostname.split(".")[0] || "watts-tool";
  const endpoint = "https://api.wattsunified.com/api/submissions";

  const money = (value) => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

  function addStatus(form) {
    let status = form.querySelector("[data-owned-status]");
    if (!status) {
      status = document.createElement("p");
      status.dataset.ownedStatus = "";
      status.setAttribute("role", "status");
      status.style.cssText = "margin:.75rem 0 0;font:600 14px/1.4 system-ui;color:#a88428";
      form.appendChild(status);
    }
    return status;
  }

  function collect(form) {
    const data = {};
    form.querySelectorAll("input,select,textarea").forEach((field, index) => {
      if (field.type === "password" || field.type === "file" || field.disabled) return;
      if ((field.type === "checkbox" || field.type === "radio") && !field.checked) return;
      const key = field.name || field.id || `field_${index + 1}`;
      data[key] = field.value;
    });
    return data;
  }

  document.querySelectorAll("form").forEach((form) => {
    if (!form.querySelector('input[name="company"]')) {
      const trap = document.createElement("input");
      trap.name = "company";
      trap.autocomplete = "off";
      trap.tabIndex = -1;
      trap.setAttribute("aria-hidden", "true");
      trap.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden";
      form.appendChild(trap);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = addStatus(form);
      const submit = form.querySelector('[type="submit"]');
      status.textContent = "Sending securely…";
      if (submit) submit.disabled = true;
      const values = collect(form);
      const name = values.name || values.fullName || [values.firstName, values.lastName].filter(Boolean).join(" ");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tool,
            sourceHost: location.hostname,
            name,
            email: values.email || "",
            phone: values.phone || "",
            company: values.company || "",
            data: values
          })
        });
        if (!response.ok) throw new Error("Unable to submit");
        status.style.color = "#16794b";
        status.textContent = "Thank you. Your information was sent securely to Watts Unified Solutions.";
        form.reset();
      } catch (_) {
        status.style.color = "#b42318";
        status.textContent = "We could not send this yet. Please call Watts Unified Solutions or try again.";
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  if (tool === "tax-buckets") {
    const fields = [...document.querySelectorAll("input")].slice(0, 7);
    if (fields.length === 7) {
      const panel = document.createElement("section");
      panel.setAttribute("aria-live", "polite");
      panel.style.cssText = "max-width:72rem;margin:1.5rem auto;padding:1.25rem;border:1px solid #d7b85a;border-radius:14px;background:#fffaf0;box-shadow:0 10px 25px #00000010;font-family:system-ui";
      const anchor = fields[6].closest("section") || fields[6].parentElement;
      anchor?.insertAdjacentElement("afterend", panel);
      const update = () => {
        const [currentAge, retirementAge, income, taxablePct, deferred, growth, futureTax] = fields.map((field) => Number(field.value) || 0);
        const years = Math.max(0, retirementAge - currentAge);
        const factor = Math.pow(1 + growth / 100, years);
        const taxableFuture = income * (taxablePct / 100) * factor;
        const deferredFuture = deferred * factor;
        const estimatedTax = deferredFuture * (futureTax / 100);
        panel.innerHTML = `<h2 style="font-size:1.2rem;font-weight:800;margin:0 0 .8rem">Your projected tax picture</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem"><div><small>Years until retirement</small><strong style="display:block;font-size:1.35rem">${years}</strong></div><div><small>Projected taxable savings</small><strong style="display:block;font-size:1.35rem">${money(taxableFuture)}</strong></div><div><small>Projected tax-deferred balance</small><strong style="display:block;font-size:1.35rem">${money(deferredFuture)}</strong></div><div><small>Estimated future tax exposure</small><strong style="display:block;font-size:1.35rem;color:#9b2c2c">${money(estimatedTax)}</strong></div></div><p style="font-size:.75rem;margin:.8rem 0 0;color:#555">Educational estimate only; actual returns and tax rules may differ.</p>`;
      };
      fields.forEach((field) => field.addEventListener("input", update));
      update();
    }
  }

  if (tool === "veteran-roadmap") {
    const numeric = [...document.querySelectorAll('input:not([name])')].filter((field) => !Number.isNaN(Number(field.value)));
    numeric.forEach((field) => field.addEventListener("input", () => {
      document.documentElement.dataset.ownedCalculationUpdated = "true";
    }));
  }
})();
