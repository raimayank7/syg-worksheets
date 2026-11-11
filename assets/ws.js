/* worksheets: every sheet is made in the browser from a sheet number (seed), so the same number always gives the same sheet. */
(function () {
  'use strict';
  var d = document, SYG = window.SYG, form = d.getElementById('ws-form');
  if (!form) return;
  var ID = form.getAttribute('data-ws'), NAME = form.getAttribute('data-name');
  var paper = d.getElementById('paper'), key = d.getElementById('key');

  /* ---------- helpers ---------- */
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R;
  function ri(a, b) { return a + Math.floor(R() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function IN(n) { return Number(n).toLocaleString('en-IN'); }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function nd(digs) { return ri(digs === 1 ? 1 : Math.pow(10, digs - 1), Math.pow(10, digs) - 1); }
  var BL = '<u class="bl"></u>', BLS = '<u class="bl s"></u>';
  function V(a, op, b) { return '<span class="v"><span>' + a + '</span><span><i>' + op + '</i>' + b + '</span><span class="ln"></span></span>'; }
  function FR(n, m) { return '<span class="fr"><i>' + n + '</i><i>' + m + '</i></span>'; }
  function frac(n, m) { var g = gcd(n, m); n /= g; m /= g; if (m === 1) return String(n); return n > m ? Math.floor(n / m) + ' ' + (n % m) + '/' + m + ' (' + n + '/' + m + ')' : n + '/' + m; }
  function uniq(n, make) { var out = [], seen = {}, tries = 0; while (out.length < n && tries++ < n * 60) { var x = make(); if (!x) continue; if (seen[x.q] && tries < n * 40) continue; seen[x.q] = 1; out.push(x); } return out; }
  function digitsOf(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s.split('').map(Number); }

  var ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); }
  function words(n) { /* Indian system: thousand, lakh, crore */
    if (n === 0) return 'zero';
    var p = [], cr = Math.floor(n / 10000000), lk = Math.floor(n / 100000) % 100, th = Math.floor(n / 1000) % 100, h = Math.floor(n / 100) % 10, r = n % 100;
    if (cr) p.push(two(cr) + ' crore'); if (lk) p.push(two(lk) + ' lakh'); if (th) p.push(two(th) + ' thousand'); if (h) p.push(ONES[h] + ' hundred');
    if (r) p.push((p.length ? 'and ' : '') + two(r));
    return p.join(' ');
  }
  function roman(n) { var v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'], o = ''; for (var i = 0; i < v.length; i++) while (n >= v[i]) { o += s[i]; n -= v[i]; } return o; }
  function clock(h, m) {
    var s = '<svg class="clk" viewBox="0 0 120 120" role="img" aria-label="Clock face"><circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3"/>';
    for (var i = 1; i <= 12; i++) { var a = i * Math.PI / 6; s += '<text x="' + (60 + 43 * Math.sin(a)).toFixed(1) + '" y="' + (64.5 - 43 * Math.cos(a)).toFixed(1) + '" text-anchor="middle" font-size="12" font-family="Arial,sans-serif" fill="currentColor">' + i + '</text>'; }
    for (i = 0; i < 60; i++) { a = i * Math.PI / 30; var r1 = i % 5 ? 53 : 51; s += '<line x1="' + (60 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (60 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (60 + 56 * Math.sin(a)).toFixed(1) + '" y2="' + (60 - 56 * Math.cos(a)).toFixed(1) + '" stroke="currentColor" stroke-width="' + (i % 5 ? .6 : 1.4) + '"/>'; }
    var ma = m * Math.PI / 30, ha = ((h % 12) + m / 60) * Math.PI / 6;
    s += '<line x1="60" y1="60" x2="' + (60 + 24 * Math.sin(ha)).toFixed(1) + '" y2="' + (60 - 24 * Math.cos(ha)).toFixed(1) + '" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>';
    s += '<line x1="60" y1="60" x2="' + (60 + 36 * Math.sin(ma)).toFixed(1) + '" y2="' + (60 - 36 * Math.cos(ma)).toFixed(1) + '" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="60" cy="60" r="3" fill="currentColor"/></svg>';
    return s;
  }
  var SHAPES = {
    star: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>', circle: '<circle cx="12" cy="12" r="9"/>',
    heart: '<path d="M12 21C5 15.5 2 12 2 8.2 2 5.3 4.2 3 7 3c1.9 0 3.7 1 5 2.7C13.300 4 15.100 3 17 3c2.800 0 5 2.300 5 5.200 0 3.800-3 7.300-10 12.800z"/>', triangle: '<path d="M12 3l10 18H2z"/>', square: '<rect x="3" y="3" width="18" height="18" rx="2"/>'
  };
  function shape(k) { return '<svg class="shp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' + SHAPES[k] + '</svg>'; }

  /* ---------- generators: return {instr, cols, minw, items:[{q,a}]} or {instr, html, keyHtml} ---------- */
  var G = {};
  G.addition = function (o) {
    var dg = +o.d, items = uniq(+o.n, function () {
      var a, b, i, ad, bd, carry;
      if (o.c === 'no') { a = 0; b = 0; for (i = 0; i < dg; i++) { var top = i === dg - 1, x = ri(top ? 1 : 0, top ? 8 : 9), y = ri(top && dg > 1 ? 1 : 0, 9 - x); if (dg === 1 && !y) y = ri(1, 9 - x); a += x * Math.pow(10, i); b += y * Math.pow(10, i); } }
      else { a = nd(dg); b = nd(dg); ad = digitsOf(a, dg); bd = digitsOf(b, dg); carry = false; for (i = dg - 1, x = 0; i >= 0; i--) { x = ad[i] + bd[i] + x > 9 ? 1 : 0; if (x) carry = true; } if (o.c === 'yes' && !carry) return null; }
      return { q: o.l === 'h' ? a + ' + ' + b + ' = ' + BL : V(a, '+', b), a: String(a + b) };
    });
    return { instr: 'Add.', cols: o.l === 'h' ? (dg > 2 ? 2 : 3) : (dg > 3 ? 4 : 5), minw: o.l === 'h' ? 150 : 84, items: items };
  };
  G.subtraction = function (o) {
    var dg = +o.d, items = uniq(+o.n, function () {
      var a, b, i, x, y, ad, bd, bor;
      if (o.c === 'no') { a = 0; b = 0; for (i = 0; i < dg; i++) { var top = i === dg - 1; x = ri(top ? 1 : 0, 9); y = ri(0, x); a += x * Math.pow(10, i); b += y * Math.pow(10, i); } if (!b || a === b) return null; }
      else { a = nd(dg); b = nd(dg); if (a < b) { x = a; a = b; b = x; } if (a === b) return null; ad = digitsOf(a, dg); bd = digitsOf(b, dg); bor = false; for (i = 0; i < dg; i++) if (ad[i] < bd[i]) bor = true; if (o.c === 'yes' && dg > 1 && !bor) return null; }
      return { q: o.l === 'h' ? a + ' − ' + b + ' = ' + BL : V(a, '−', b), a: String(a - b) };
    });
    return { instr: 'Subtract.', cols: o.l === 'h' ? (dg > 2 ? 2 : 3) : (dg > 3 ? 4 : 5), minw: o.l === 'h' ? 150 : 84, items: items };
  };
  G.multiplication = function (o) {
    var items = uniq(+o.n, function () {
      var a, b;
      if (o.m === 'tables') { var t1 = Math.min(+o.f, +o.t), t2 = Math.max(+o.f, +o.t); a = ri(t1, t2); b = ri(1, 10); return { q: a + ' × ' + b + ' = ' + BL, a: String(a * b) }; }
      a = nd(o.m === '3x1' ? 3 : 2); b = o.m === '2x2' ? nd(2) : ri(2, 9);
      return { q: V(a, '×', b), a: IN(a * b) };
    });
    return { instr: o.m === 'tables' ? 'Multiply. Write the answer.' : 'Multiply.', cols: o.m === 'tables' ? 3 : 5, minw: o.m === 'tables' ? 140 : 84, items: items };
  };
  G.division = function (o) {
    var items = uniq(+o.n, function () {
      var b = ri(2, 9), q, a, r;
      if (o.m === 'facts') { b = ri(2, 10); q = ri(1, 10); return { q: (b * q) + ' ÷ ' + b + ' = ' + BL, a: String(q) }; }
      if (o.m === 'rem') { a = ri(11, 99); q = Math.floor(a / b); r = a % b; if (!r) return null; return { q: a + ' ÷ ' + b + ' = ' + BLS + ' R ' + BLS, a: q + ' R ' + r }; }
      q = ri(Math.ceil(100 / b), Math.floor(999 / b)); return { q: (b * q) + ' ÷ ' + b + ' = ' + BL, a: String(q) };
    });
    return { instr: o.m === 'rem' ? 'Divide. Write the quotient and the remainder (R).' : 'Divide.', cols: o.m === 'rem' ? 2 : 3, minw: 150, items: items };
  };
  G.tables = function (o) {
    var t1 = Math.min(+o.f, +o.t), t2 = Math.min(Math.max(+o.f, +o.t), t1 + 11), h = '', k = '';
    for (var t = t1; t <= t2; t++) {
      h += '<div class="tb"><b>Table of ' + t + '</b>'; k += '<div class="tb"><b>Table of ' + t + '</b>';
      for (var i = 1; i <= 10; i++) {
        var blank = o.m === 'blank' || (o.m === 'mixed' && R() < .5);
        h += '<span>' + t + ' × ' + i + ' = ' + (blank ? BLS : t * i) + '</span>'; k += '<span>' + t + ' × ' + i + ' = ' + t * i + '</span>';
      }
      h += '</div>'; k += '</div>';
    }
    return { instr: o.m === 'filled' ? 'Read each table aloud. Then cover it and say it from memory.' : 'Complete the tables.', html: '<div class="tbs">' + h + '</div>', keyHtml: o.m === 'filled' ? '' : '<div class="tbs">' + k + '</div>' };
  };
  G.missing = function (o) {
    var mx = +o.lv, items = uniq(+o.n, function () {
      var a, b, c, t = ri(0, 3);
      if (o.op === 'as') {
        a = ri(1, mx - 1); b = ri(1, mx - a); c = a + b;
        return [{ q: a + ' + ' + BLS + ' = ' + c, a: String(b) }, { q: BLS + ' + ' + b + ' = ' + c, a: String(a) }, { q: c + ' − ' + BLS + ' = ' + a, a: String(b) }, { q: BLS + ' − ' + b + ' = ' + a, a: String(c) }][t];
      }
      a = ri(2, mx === 20 ? 5 : 10); b = ri(2, 10); c = a * b;
      return [{ q: a + ' × ' + BLS + ' = ' + c, a: String(b) }, { q: BLS + ' × ' + b + ' = ' + c, a: String(a) }, { q: c + ' ÷ ' + BLS + ' = ' + a, a: String(b) }, { q: BLS + ' ÷ ' + b + ' = ' + a, a: String(c) }][t];
    });
    return { instr: 'Write the missing number.', cols: 3, minw: 150, items: items };
  };
  G.sequences = function (o) {
    var items = uniq(+o.n, function () {
      var step = o.k === 'easy' ? pick([1, 2, 5, 10]) : ri(2, 12), back = o.k === 'back' || (o.k === 'mixed' && R() < .4), start, seq = [], i;
      if (back) { step = o.k === 'back' ? pick([1, 2, 5, 10]) : step; start = ri(step * 6, step * 6 + 60); for (i = 0; i < 6; i++) seq.push(start - step * i); }
      else { start = o.k === 'easy' && R() < .5 ? step : ri(1, 60); for (i = 0; i < 6; i++) seq.push(start + step * i); }
      var holes = shuffle([2, 3, 4, 5]).slice(0, 3), q = seq.map(function (x, j) { return holes.indexOf(j) > -1 ? BLS : x; }).join(', ');
      return { q: q, a: seq.join(', ') };
    });
    return { instr: 'Find the rule. Write the missing numbers.', cols: 2, minw: 230, items: items };
  };
  G.comparing = function (o) {
    var dg = +o.d, items = uniq(+o.n, function () {
      var a = nd(dg), b = R() < .12 ? a : R() < .5 ? nd(dg) : Math.max(1, a + ri(-9, 9));
      return { q: IN(a) + ' <span class="box"></span> ' + IN(b), a: a > b ? '>' : a < b ? '<' : '=' };
    });
    return { instr: 'Write >, < or = in the box.', cols: 3, minw: 150, items: items };
  };
  var PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'lakhs'];
  G.placevalue = function (o) {
    var dg = +o.d, items = uniq(+o.n, function () {
      var n = nd(dg), ds = String(n).split('');
      if (o.m === 'expand') { var parts = []; ds.forEach(function (x, i) { if (+x) parts.push(IN(+x * Math.pow(10, ds.length - 1 - i))); }); if (parts.length < 2) return null; return { q: IN(n) + ' = ' + '<u class="bl l"></u>', a: parts.join(' + ') }; }
      var idx = []; ds.forEach(function (x, i) { if (+x) idx.push(i); }); var i = pick(idx), p = ds.length - 1 - i;
      /* commas are left out here so the underlined digit is easy to see */
      return { q: ds.map(function (x, j) { return j === i ? '<u class="ud">' + x + '</u>' : x; }).join('') + ' : ' + BL, a: IN(+ds[i] * Math.pow(10, p)) + ' (' + PLACES[p] + ')' };
    });
    return { instr: o.m === 'expand' ? 'Write each number in expanded form.' : 'Write the place value of the underlined digit.', cols: o.m === 'expand' ? 1 : 2, minw: o.m === 'expand' ? 260 : 190, items: items };
  };
  G.fractions = function (o) {
    var items = uniq(+o.n, function () {
      var m = ri(3, 12), a, b, x, y;
      if (o.m === 'add') { a = ri(1, m - 1); b = ri(1, m - 1); return { q: FR(a, m) + ' + ' + FR(b, m) + ' = ' + BLS, a: frac(a + b, m) }; }
      if (o.m === 'sub') { a = ri(2, m - 1); b = ri(1, a - 1); return { q: FR(a, m) + ' − ' + FR(b, m) + ' = ' + BLS, a: frac(a - b, m) }; }
      if (o.m === 'simplify') { x = ri(2, 6); b = ri(2, 9); a = ri(1, b - 1); if (gcd(a, b) > 1) return null; return { q: FR(a * x, b * x) + ' = ' + BLS, a: a + '/' + b }; }
      var n = ri(2, 10); a = ri(1, m - 1); b = ri(1, n - 1); x = a * n; y = b * m;
      return { q: FR(a, m) + ' <span class="box"></span> ' + FR(b, n), a: x > y ? '>' : x < y ? '<' : '=' };
    });
    return { instr: { add: 'Add the fractions. Write the answer in its simplest form.', sub: 'Subtract the fractions. Write the answer in its simplest form.', simplify: 'Write each fraction in its simplest form.', compare: 'Compare the fractions. Write >, < or = in the box.' }[o.m], cols: 3, minw: 160, items: items };
  };
  G.decimals = function (o) {
    var p = +o.p, f = Math.pow(10, p), items = uniq(+o.n, function () {
      var a = ri(f, 99 * f) / f, b = ri(1, 60 * f) / f, sub = o.op === 'sub' || (o.op === 'mix' && R() < .5), t;
      if (sub && a < b) { t = a; a = b; b = t; }
      return { q: V(a.toFixed(p), sub ? '−' : '+', b.toFixed(p)), a: (sub ? a - b : a + b).toFixed(p) };
    });
    return { instr: 'Work out the answers. Keep the decimal points in one line.', cols: 4, minw: 100, items: items };
  };
  G.rounding = function (o) {
    var to = +o.to, items = uniq(+o.n, function () { var n = ri(to === 10 ? 11 : to, to * 100 - 1); if (n % to === 0) return null; return { q: IN(n) + ' → ' + BL, a: IN(Math.round(n / to) * to) }; });
    return { instr: 'Round each number to the nearest ' + IN(to) + '.', cols: 3, minw: 160, items: items };
  };
  G.time = function (o) {
    var items = uniq(+o.n, function () {
      var h = ri(1, 12), m = o.lv === 'hour' ? 0 : o.lv === 'half' ? pick([0, 30]) : o.lv === 'quarter' ? pick([0, 15, 30, 45]) : o.lv === 'five' ? ri(0, 11) * 5 : ri(0, 59);
      return { q: clock(h, m) + '<span class="tm">' + BLS + ' : ' + BLS + '</span>', a: h + ':' + (m < 10 ? '0' : '') + m };
    });
    return { instr: 'Look at each clock. Write the time.', cols: 3, minw: 130, items: items, cls: 'clocks' };
  };
  G.money = function (o) {
    var items = uniq(+o.n, function () {
      var a, b, c;
      if (o.m === 'change') { a = pick([20, 50, 100, 200, 500]); b = ri(Math.ceil(a / 5), a - 1); return { q: 'You pay ₹' + a + '. The bill is ₹' + b + '. Change = ₹' + BLS, a: '₹' + (a - b) }; }
      a = ri(5, 250); b = ri(5, 250); c = ri(5, 100);
      if (o.m === 'three') return { q: '₹' + a + ' + ₹' + b + ' + ₹' + c + ' = ₹' + BLS, a: '₹' + (a + b + c) };
      if (o.m === 'paise') { a = ri(2, 99) + pick([.25, .5, .75]); b = ri(2, 99) + pick([.25, .5, .75]); return { q: '₹' + a.toFixed(2) + ' + ₹' + b.toFixed(2) + ' = ₹' + BLS, a: '₹' + (a + b).toFixed(2) }; }
      return { q: '₹' + a + ' + ₹' + b + ' = ₹' + BLS, a: '₹' + (a + b) };
    });
    return { instr: o.m === 'change' ? 'Work out the change you get back.' : 'Add the amounts.', cols: 2, minw: 230, items: items };
  };
  G.bodmas = function (o) {
    var items = uniq(+o.n, function () {
      var a = ri(2, 12), b = ri(2, 9), c = ri(2, 9), t = ri(0, 5), X = ' × ', D = ' ÷ ', M = ' − ', q, v;
      if (o.lv === '1') {
        if (t === 0) { q = a + ' + ' + b + X + c; v = a + b * c; } else if (t === 1) { q = a + X + b + M + c; v = a * b - c; } else if (t === 2) { q = (a + b) + M + b + ' + ' + c; v = a + c; }
        else if (t === 3) { q = (a * b) + D + b + ' + ' + c; v = a + c; } else if (t === 4) { q = a + ' + ' + (b * c) + D + c; v = a + b; } else { q = (a * b + c) + M + a + X + b; v = c; }
      } else {
        if (t === 0) { q = '(' + a + ' + ' + b + ')' + X + c; v = (a + b) * c; } else if (t === 1) { q = a + X + '(' + (b + c) + M + c + ')'; v = a * b; } else if (t === 2) { q = '(' + (a * c + b * c) + M + b * c + ')' + D + c; v = a; }
        else if (t === 3) { q = (a + b + c) + M + '(' + b + ' + ' + c + ')'; v = a; } else if (t === 4) { q = (a * b) + D + '(' + (b + c) + M + c + ')'; v = a; } else { q = '(' + a + ' + ' + b + ')' + X + '(' + (c + 2) + M + '2)'; v = (a + b) * c; }
      }
      return { q: q + ' = ' + BLS, a: String(v) };
    });
    return { instr: 'Work out each answer. Remember the order: brackets, of, division, multiplication, addition, subtraction.', cols: 2, minw: 230, items: items };
  };
  G.numbernames = function (o) {
    var mx = +o.mx, items = uniq(+o.n, function () {
      var n = ri(mx <= 100 ? 11 : mx / 100, mx - 1);
      return o.m === 'words' ? { q: IN(n) + '<u class="bl x"></u>', a: words(n) } : { q: words(n) + ' = ' + BL, a: IN(n) };
    });
    return { instr: o.m === 'words' ? 'Write each number in words.' : 'Write each number name in figures.', cols: 1, minw: 260, items: items };
  };
  G.roman = function (o) {
    var mx = +o.mx, items = uniq(+o.n, function () { var n = ri(1, mx), toR = o.m === 'to' || (o.m === 'mix' && R() < .5); return toR ? { q: n + ' = ' + BL, a: roman(n) } : { q: roman(n) + ' = ' + BL, a: String(n) }; });
    return { instr: o.m === 'to' ? 'Write each number in Roman numerals.' : o.m === 'from' ? 'Write each Roman numeral as a number.' : 'Change numbers to Roman numerals and Roman numerals to numbers.', cols: 3, minw: 150, items: items };
  };
  G.percentage = function (o) {
    var ps = o.lv === '1' ? [10, 20, 25, 50] : [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80], items = uniq(+o.n, function () { var p = pick(ps), base = ri(1, 20) * (100 / gcd(p, 100)); return { q: p + '% of ' + IN(base) + ' = ' + BL, a: IN(p * base / 100) }; });
    return { instr: 'Find the percentage of each number.', cols: 2, minw: 190, items: items };
  };
  G.grid = function (o) {
    var st = +o.st, hole = +o.h / 100, h = '<table class="g100"><tbody>', k = h;
    for (var r = 0; r < 10; r++) { h += '<tr>'; k += '<tr>'; for (var c = 0; c < 10; c++) { var n = st + r * 10 + c, b = R() < hole; h += '<td>' + (b ? '' : n) + '</td>'; k += '<td>' + n + '</td>'; } h += '</tr>'; k += '</tr>'; }
    return { instr: 'Fill in the missing numbers from ' + st + ' to ' + (st + 99) + '.', html: h + '</tbody></table>', keyHtml: k + '</tbody></table>' };
  };
  G.counting = function (o) {
    var mx = +o.mx, kinds = ['star', 'circle', 'heart', 'triangle', 'square'], items = uniq(+o.n, function () { var n = ri(1, mx), s = pick(kinds), h = ''; for (var i = 0; i < n; i++) h += shape(s); return { q: '<span class="cnt">' + h + '</span><span class="box big"></span>', a: String(n) }; });
    return { instr: 'Count the shapes. Write the number in the box.', cols: mx > 10 ? 1 : 2, minw: 230, items: items, cls: 'count' };
  };
  G.hcflcm = function (o) {
    var items = uniq(+o.n, function () { var g = ri(2, o.lv === '1' ? 6 : 12), a = g * ri(1, 6), b = g * ri(2, 7); if (a === b) return null; var x = gcd(a, b); return { q: a + ' and ' + b + ': HCF = ' + BLS + ' LCM = ' + BLS, a: 'HCF ' + x + ', LCM ' + (a * b / x) }; });
    return { instr: 'Find the HCF and the LCM of each pair of numbers.', cols: 2, minw: 250, items: items };
  };
  G.integers = function (o) {
    function s(n) { return n < 0 ? '(−' + (-n) + ')' : String(n); }
    var items = uniq(+o.n, function () {
      var a = ri(-12, 12), b = ri(-12, 12), t = R() < .5; if (!a || !b || (a > 0 && b > 0)) return null;
      if (o.m === 'as') return t ? { q: s(a) + ' + ' + s(b) + ' = ' + BL, a: String(a + b).replace('-', '−') } : { q: s(a) + ' − ' + s(b) + ' = ' + BL, a: String(a - b).replace('-', '−') };
      return t ? { q: s(a) + ' × ' + s(b) + ' = ' + BL, a: String(a * b).replace('-', '−') } : { q: s(a * b) + ' ÷ ' + s(b) + ' = ' + BL, a: String(a).replace('-', '−') };
    });
    return { instr: o.m === 'as' ? 'Add or subtract the integers.' : 'Multiply or divide the integers.', cols: 2, minw: 200, items: items };
  };
  G.equations = function (o) {
    var items = uniq(+o.n, function () {
      var x = ri(1, 12), a = ri(2, 9), b = ri(1, 20), t = ri(0, 3), q;
      if (o.lv === '2') q = R() < .5 ? a + 'x + ' + b + ' = ' + (a * x + b) : a + 'x − ' + b + ' = ' + (a * x - b);
      else q = t === 0 ? 'x + ' + b + ' = ' + (x + b) : t === 1 ? 'x − ' + b + ' = ' + (x - b).toString().replace('-', '−') : t === 2 ? a + 'x = ' + a * x : FR('x', a) + ' = ' + x;
      return { q: q + '<span class="xs">x = ' + BLS + '</span>', a: 'x = ' + (o.lv !== '2' && t === 3 ? a * x : x) };
    });
    return { instr: 'Solve each equation. Find the value of x.', cols: 2, minw: 230, items: items };
  };
  G.areaperimeter = function (o) {
    var items = uniq(+o.n, function () {
      var u = pick(['cm', 'm']), l = ri(3, o.lv === '1' ? 12 : 40), b = ri(2, l - 1), sq = o.sh === 'square' || (o.sh === 'both' && R() < .35);
      return sq ? { q: 'Square: side ' + l + ' ' + u + '<span class="xs">Perimeter = ' + BL + ' Area = ' + BL + '</span>', a: 'P = ' + 4 * l + ' ' + u + ', A = ' + IN(l * l) + ' sq ' + u }
        : { q: 'Rectangle: length ' + l + ' ' + u + ', breadth ' + b + ' ' + u + '<span class="xs">Perimeter = ' + BL + ' Area = ' + BL + '</span>', a: 'P = ' + 2 * (l + b) + ' ' + u + ', A = ' + IN(l * b) + ' sq ' + u };
    });
    return { instr: 'Find the perimeter and the area of each shape.', cols: 1, minw: 280, items: items };
  };
  G.units = function (o) {
    var U = { len: [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10]], wt: [['kg', 'g', 1000]], cap: [['L', 'mL', 1000]], time: [['h', 'min', 60], ['min', 's', 60]] };
    var list = o.k === 'all' ? U.len.concat(U.wt, U.cap, U.time) : U[o.k], items = uniq(+o.n, function () {
      var u = pick(list), n = ri(1, 12), t = ri(0, 2), ex = u[2] === 60 ? ri(1, 59) : u[2] === 10 ? ri(1, 9) : ri(1, u[2] / 10 - 1) * 5;
      if (t === 0) return { q: n + ' ' + u[0] + ' = ' + BL + ' ' + u[1], a: IN(n * u[2]) + ' ' + u[1] };
      if (t === 1) return { q: IN(n * u[2]) + ' ' + u[1] + ' = ' + BL + ' ' + u[0], a: n + ' ' + u[0] };
      return { q: n + ' ' + u[0] + ' ' + ex + ' ' + u[1] + ' = ' + BL + ' ' + u[1], a: IN(n * u[2] + ex) + ' ' + u[1] };
    });
    return { instr: 'Change each measure to the unit shown.', cols: 2, minw: 230, items: items };
  };

  /* writing paper: lines are drawn as borders so they always print */
  G.paper = function (o) {
    var h = '', i, j, rows;
    if (o.k === 'four' || o.k === 'two') { rows = o.sz === 'l' ? 11 : o.sz === 'm' ? 14 : 18; for (i = 0; i < rows; i++) h += '<div class="rule ' + o.k + ' ' + o.sz + '"><i></i><i></i></div>'; }
    else if (o.k === 'single') { rows = o.sz === 'l' ? 20 : o.sz === 'm' ? 25 : 30; for (i = 0; i < rows; i++) h += '<div class="rule single ' + o.sz + '"></div>'; }
    else { var n = o.sz === 'l' ? 12 : o.sz === 'm' ? 17 : 26; h = '<table class="sqr ' + o.k + '"><tbody>'; for (i = 0; i < Math.round(n * 1.38); i++) { h += '<tr>'; for (j = 0; j < n; j++) h += '<td></td>'; h += '</tr>'; } h += '</tbody></table>'; }
    return { instr: '', html: h, keyHtml: '', noNum: true };
  };
  var SETS = {
    caps: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', small: 'a b c d e f g h i j k l m n o p q r s t u v w x y z', nums: '0 1 2 3 4 5 6 7 8 9',
    swar: 'अ आ इ ई उ ऊ ए ऐ ओ औ अं अः',
    vyanjan: 'क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह',
    gurmukhi: 'ੳ ਅ ੲ ਸ ਹ ਕ ਖ ਗ ਘ ਙ ਚ ਛ ਜ ਝ ਞ ਟ ਠ ਡ ਢ ਣ ਤ ਥ ਦ ਧ ਨ ਪ ਫ ਬ ਭ ਮ ਯ ਰ ਲ ਵ ੜ'
  };
  G.tracing = function (o) {
    var custom = (o.tx || '').trim(), latin = o.set === 'caps' || o.set === 'small' || o.set === 'nums' || (o.set === 'custom' && !/[ऀ-੿]/.test(custom));
    var font = latin ? "Andika,'Comic Sans MS',Arial,sans-serif" : o.set === 'gurmukhi' || /[਀-੿]/.test(custom) ? "'Noto Sans Gurmukhi','Raavi',sans-serif" : "'Noto Sans Devanagari','Nirmala UI','Mangal',sans-serif";
    var per = +o.per, units = o.set === 'custom' ? [custom || 'Your name'] : SETS[o.set].split(' '), h = '', page = 0;
    function row(text, grey) {
      /* SVG so that the letters sit exactly on the base line: y of <text> is the base line */
      var s = '<svg class="tr" viewBox="0 0 1000 150" preserveAspectRatio="xMinYMid meet"><line x1="0" y1="28" x2="1000" y2="28" class="g1"/>' + (latin ? '<line x1="0" y1="66" x2="1000" y2="66" class="g2"/>' : '') + '<line x1="0" y1="104" x2="1000" y2="104" class="g1"/>' + (latin ? '<line x1="0" y1="138" x2="1000" y2="138" class="g3"/>' : '');
      if (text) s += '<text x="14" y="104" font-size="' + (latin ? 105 : 84) + '" style="font-family:' + font + '" class="' + (grey ? 'gt' : 'bt') + '"' + (text.length > 14 ? ' textLength="960" lengthAdjust="spacingAndGlyphs"' : '') + '>' + SYG.esc(text) + '</text>';
      return s + '</svg>';
    }
    units.forEach(function (u) {
      if (o.set === 'custom') { for (var i = 0; i < 9; i++) h += row(i % 3 < 2 ? u : '', true); return; }
      var n = Math.max(3, Math.min(9, Math.floor(11 / Math.max(1, u.length)))), t = []; for (var j = 0; j < n; j++) t.push(u);
      h += '<div class="tu">' + row(t.join(latin ? '  ' : '   '), true) + (per === 2 ? row('', true) : '') + '</div>';
    });
    return { instr: 'Trace over the grey letters with a pencil. Then write them yourself on the empty lines.', html: '<div class="trs">' + h + '</div>', keyHtml: '', noNum: true };
  };
  var WORDS = {
    fruits: 'MANGO APPLE BANANA GRAPES ORANGE PAPAYA GUAVA LITCHI CHERRY PEACH LEMON MELON', animals: 'TIGER LION ELEPHANT MONKEY HORSE CAMEL RABBIT DEER ZEBRA PANDA FOX BEAR', colours: 'RED BLUE GREEN YELLOW ORANGE PURPLE PINK BROWN BLACK WHITE GREY VIOLET',
    vegetables: 'POTATO TOMATO ONION CARROT RADISH PEAS BRINJAL OKRA SPINACH PUMPKIN GARLIC GINGER', body: 'HEAD NOSE EYES EARS MOUTH HAND FOOT KNEE NECK ARM LEG TEETH', days: 'MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY TODAY WEEK MONTH YEAR',
    shapes: 'CIRCLE SQUARE TRIANGLE OVAL CUBE CONE SPHERE LINE POINT ANGLE CURVE STAR', family: 'MOTHER FATHER SISTER BROTHER UNCLE AUNT COUSIN BABY SON DAUGHTER FAMILY HOME'
  };
  G.wordsearch = function (o) {
    var n = +o.sz, raw = o.set === 'custom' ? (o.tx || '').toUpperCase().split(/[^A-Z]+/) : WORDS[o.set].split(' ');
    var list = raw.filter(function (w, i) { return w.length > 1 && w.length <= n && raw.indexOf(w) === i; }).slice(0, 14);
    if (!list.length) list = WORDS.fruits.split(' ').slice(0, 8);
    var dirs = o.lv === '1' ? [[0, 1], [1, 0]] : o.lv === '2' ? [[0, 1], [1, 0], [1, 1], [-1, 1]] : [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    var g = [], mark = [], placed = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); mark.push([]); for (c = 0; c < n; c++) { g[r].push(''); mark[r].push(0); } }
    list.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (w) {
      for (var t = 0; t < 200; t++) {
        var dr = pick(dirs), r0 = ri(0, n - 1), c0 = ri(0, n - 1), r1 = r0 + dr[0] * (w.length - 1), c1 = c0 + dr[1] * (w.length - 1), ok = true, i;
        if (r1 < 0 || r1 >= n || c1 < 0 || c1 >= n) continue;
        for (i = 0; i < w.length; i++) { var ch = g[r0 + dr[0] * i][c0 + dr[1] * i]; if (ch && ch !== w[i]) { ok = false; break; } }
        if (!ok) continue;
        for (i = 0; i < w.length; i++) { g[r0 + dr[0] * i][c0 + dr[1] * i] = w[i]; mark[r0 + dr[0] * i][c0 + dr[1] * i] = 1; }
        placed.push(w); return;
      }
    });
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', h = '<table class="wsg"><tbody>', k = h;
    for (r = 0; r < n; r++) { h += '<tr>'; k += '<tr>'; for (c = 0; c < n; c++) { var ch = g[r][c] || A[ri(0, 25)]; h += '<td>' + ch + '</td>'; k += '<td' + (mark[r][c] ? ' class="hit"' : '') + '>' + ch + '</td>'; } h += '</tr>'; k += '</tr>'; }
    var wl = '<ul class="wl">' + placed.sort().map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>';
    return { instr: 'Find these ' + placed.length + ' words in the grid. Words go ' + (o.lv === '1' ? 'across and down' : o.lv === '2' ? 'across, down and diagonally' : 'in any direction, also backwards') + '.', html: h + '</tbody></table>' + wl, keyHtml: k + '</tbody></table>', noNum: true };
  };

  /* ---------- page ---------- */
  var seed;
  function opts() { var o = {}; form.querySelectorAll('[name]').forEach(function (e) { o[e.name] = e.type === 'checkbox' ? e.checked : e.value; }); return o; }
  function render() {
    var o = opts(); R = rng(seed);
    var out = G[ID](o), title = SYG.esc((o.title || NAME).slice(0, 60));
    var head = '<div class="p-head"><b>' + title + '</b><span>Name: <u class="bl"></u> Date: <u class="bl s2"></u></span></div>' + (out.instr ? '<p class="p-instr">' + out.instr + '</p>' : '');
    var foot = '<div class="p-foot"><span>worksheets.shareyourgroup.com</span><span>Sheet no. ' + seed + '</span></div>';
    var body = out.html != null ? out.html : '<ol class="p-items ' + (out.cls || '') + '" style="--cols:' + out.cols + ';--minw:' + out.minw + 'px">' + out.items.map(function (x) { return '<li><div class="q">' + x.q + '</div></li>'; }).join('') + '</ol>';
    paper.innerHTML = head + body + foot;
    var kh = out.html != null ? out.keyHtml : '<ol class="p-keys">' + out.items.map(function (x) { return '<li>' + x.a + '</li>'; }).join('') + '</ol>';
    var want = o.key !== false && kh;
    key.innerHTML = kh ? '<div class="p-head"><b>Answers: ' + title + '</b><span>Sheet no. ' + seed + '</span></div>' + kh : '';
    key.hidden = !want; key.classList.toggle('noprint', !want);
    var kb = form.querySelector('[name=key]'); if (kb) kb.closest('label').hidden = !kh;
    d.getElementById('ws-no').textContent = seed;
  }
  function link() { var o = opts(), q = []; Object.keys(o).forEach(function (k) { if (k !== 'title' || o[k]) q.push(k + '=' + encodeURIComponent(o[k] === true ? 1 : o[k] === false ? 0 : o[k])); }); return location.origin + location.pathname + '?' + q.join('&') + '&s=' + seed; }
  function fresh() { seed = 10000 + Math.floor(Math.random() * 89999); render(); }

  /* settings from the address (a shared or class-wise link) */
  var qs = new URLSearchParams(location.search);
  qs.forEach(function (v, k) { var e = form.querySelector('[name="' + k.replace(/[^a-z]/g, '') + '"]'); if (!e) return; if (e.type === 'checkbox') e.checked = v !== '0'; else e.value = v; if (e.tagName === 'SELECT' && e.selectedIndex < 0) e.selectedIndex = 0; });
  seed = +qs.get('s') || 0;
  if (seed >= 1 && seed < 1e9) render(); else fresh();

  form.addEventListener('input', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); fresh(); });
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ws-act]'); if (!b) return;
    var a = b.getAttribute('data-ws-act');
    if (a === 'new') fresh();
    else if (a === 'print') window.print();
    else if (a === 'link') SYG.copy(link(), 'Link to this exact sheet copied');
    else if (a === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(NAME + ' worksheet to print: ' + link()), '_blank', 'noopener');
  });
  window.WS = { G: G, render: render, setSeed: function (s) { seed = s; render(); } };
})();
