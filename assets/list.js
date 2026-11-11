/* worksheets home: filter the lists as you type */
(function () {
  'use strict';
  var d = document, q = d.querySelector('[data-filter]');
  if (!q) return;
  var items = d.querySelectorAll('[data-list] li'), none = d.querySelector('[data-none]');
  q.addEventListener('input', function () {
    var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    items.forEach(function (li) { var s = li.getAttribute('data-q'), ok = words.every(function (w) { return s.indexOf(w) > -1; }); li.hidden = !ok; if (ok) shown++; });
    d.querySelectorAll('[data-list]').forEach(function (ul) { var any = ul.querySelector('li:not([hidden])'), h = ul.previousElementSibling; ul.hidden = !any; if (h && h.tagName === 'H2') h.hidden = !any; });
    if (none) none.hidden = shown > 0;
  });
})();
