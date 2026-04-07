// Get the form and the two required input fields
var form = document.getElementById("reportForm");
var targetInput = document.getElementById("reportTarget");
var descInput = document.getElementById("reportDesc");

//form submitions
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // ── Validation ──
  // Check both required fields are filled in before doing anything
  var valid = true;

  if (!targetInput.value.trim()) {
    //heihligts thw feild with css, red!
    targetInput.classList.add("invalid");
    valid = false;
  }

  if (!descInput.value.trim()) {
    descInput.classList.add("invalid");
    valid = false;
  }

  if (!valid) return;

  // ── Build the report object ──
  var report = {
    type: document.getElementById("reportType").value,
    target: targetInput.value.trim(),
    reason: document.getElementById("reportReason").value,
    description: descInput.value.trim(),

    // records exact time of report
    // records which page the report came from
    timestamp: new Date().toISOString(),
    page: window.location.href,
  };

  // ── Save to localStorage ──
  // Reads existing reports array (or starts fresh), adds the new one, saves back
  var reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.push(report);
  localStorage.setItem("reports", JSON.stringify(reports));

  form.classList.add("d-none");
  document.getElementById("reportSuccess").classList.remove("d-none");
});

// This Removes the red invalid highlight as soon as the user starts typing in the field
targetInput.addEventListener("input", function () {
  this.classList.remove("invalid");
});

descInput.addEventListener("input", function () {
  this.classList.remove("invalid");
});
