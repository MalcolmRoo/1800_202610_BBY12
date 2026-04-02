var form = document.getElementById('reportForm');
var targetInput = document.getElementById('reportTarget');
var descInput = document.getElementById('reportDesc');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  var valid = true;

  if (!targetInput.value.trim()) {
    targetInput.classList.add('invalid');
    valid = false;
  }

  if (!descInput.value.trim()) {
    descInput.classList.add('invalid');
    valid = false;
  }

  if (!valid) return;

  var report = {
    type: document.getElementById('reportType').value,
    target: targetInput.value.trim(),
    reason: document.getElementById('reportReason').value,
    description: descInput.value.trim(),
    timestamp: new Date().toISOString(),
    page: window.location.href
  };

  var reports = JSON.parse(localStorage.getItem('reports') || '[]');
  reports.push(report);
  localStorage.setItem('reports', JSON.stringify(reports));

  form.classList.add('d-none');
  document.getElementById('reportSuccess').classList.remove('d-none');
});

targetInput.addEventListener('input', function () {
  this.classList.remove('invalid');
});

descInput.addEventListener('input', function () {
  this.classList.remove('invalid');
});
