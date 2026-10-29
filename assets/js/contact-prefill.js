/* Fills the contact form from the calculator's "Inquire about this tank" button.
   The calculator sends ?cap=...&spec=... to contact.html#inquiry. Nothing happens if those are absent. */
document.addEventListener('DOMContentLoaded', function () {
  var q = new URLSearchParams(location.search), cap = q.get('cap'), spec = q.get('spec');
  if (!cap && !spec) return;
  var form = document.querySelector('form'); if (!form) return;
  if (!form.id) form.id = 'inquiry';
  var capField = form.querySelector('[name="capacity"]'), specField = form.querySelector('[name="specification"]');
  [[capField, cap], [specField, spec]].forEach(function (p) {
    var el = p[0], val = p[1]; if (!el || !val || el.value) return;
    el.value = val;
    el.style.transition = 'box-shadow .6s ease, border-color .6s ease';
    el.style.boxShadow = '0 0 0 3px rgba(215,182,93,.45)'; el.style.borderColor = '#b8860b';
    setTimeout(function () { el.style.boxShadow = ''; el.style.borderColor = ''; }, 2600);
  });
  setTimeout(function () { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
});
