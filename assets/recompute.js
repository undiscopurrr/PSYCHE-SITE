/* SQCD-1 conformance-vector recompute, in the browser.
 * A line-for-line port of verify/sqcd1_vector.py; tests/test_recompute_page.py
 * holds the two to one output. Exact arithmetic over BigInt rationals.
 * The page reads files with the browser's own file reader and holds them in this tab. */
(function (root) {
  'use strict';

  var VECTORS_VERSION = '1.1';
  var LIMIT = 9007199254740992; // 2^53
  var MAX_DEPTH = 64;
  var MAX_DIGITS = 15;
  var MIN_MAGNITUDE = -300;
  var UTC_SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  var PARTIES = ['operator', 'customer'];
  var FUNCTIONS = ['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07'];
  var RECOMPUTED_FUNCTIONS = ['F-01', 'F-02', 'F-03', 'F-04'];
  var ALTERNATES = ['F-01', 'F-04', 'F-03'];
  var MATERIALITY = ['MT-01', 'MT-02', 'MT-03', 'MT-04', 'MT-05'];
  var CEILINGS = ['UC-01', 'UC-02', 'UC-03', 'UC-04'];
  var EXPIRY = ['EX-01', 'EX-02', 'EX-03', 'EX-04'];
  var FAULTS = ['EF-01', 'EF-02', 'EF-03', 'EF-04', 'EF-05', 'EF-06', 'EF-07'];
  var SUBSTITUTION = ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'];
  var RESOLUTION = ['DR-01', 'DR-02', 'DR-03', 'DR-04', 'DR-05', 'DR-06'];
  var LAYERS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
  var CAUSES = ['instrument-down', 'instrument-failure', 'retention-expired',
    'collector-restarted', 'never-instrumented', 'scope-excluded'];
  var CLASSES = ['A4-exclusion', 'unresolved', 'unilateral', 'non-conforming', 'disputed'];
  var READINGS = ['conforming', 'non-conforming'];
  // Annex 2 forms that take a parameter the page does not read (MT-02, UC-01 and UC-03 it reads).
  var UNREAD_PARAMETER = ['MT-01', 'MT-03', 'MT-04', 'UC-02', 'EX-04', 'EF-06', 'EF-07',
    'SB-02', 'SB-03', 'SB-04', 'DR-02', 'DR-03', 'DR-04', 'DR-05'];
  var EXPECTED_ORDER = [
    'intervals_per_subject', 'total_subject_intervals', 'a4_exclusions',
    'eligible_before_C5', 'unresolved', 'unilateral', 'eligible', 'per_subject_eligible',
    'per_subject_availability_operator', 'per_subject_availability_customer',
    'unresolved_fraction_pct', 'unilateral_fraction_pct', 'unresolved_within_ceiling',
    'period_figure_operator_pct', 'period_figure_customer_pct', 'divergence_pp', 'divergence_material',
    'first_diverging_interval', 'shortfall_intervals_agreed', 'shortfall_intervals_disputed',
    'window_accelerator_hours', 'window_fee_usd',
    'credit_operator_usd', 'credit_customer_usd', 'disputed_amount_usd', 'sigma_output',
    'terminal_state', 'terminal_state_note'];

  function Malformed(reason) { this.reason = reason; }
  function Stop(check) { this.check = check; }

  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function get(o, k) { return has(o, k) ? o[k] : null; }
  function isObj(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function inList(list, x) { return typeof x === 'string' && list.indexOf(x) >= 0; }
  function text(x) { return typeof x === 'string' && x ? x : null; }
  // Seconds since 1970-01-01T00:00:00Z for a valid YYYY-MM-DDTHH:MM:SSZ stamp, else null.
  function epoch(stamp) {
    if (!(typeof stamp === 'string' && UTC_SECOND.test(stamp))) return null;
    var y = parseInt(stamp.slice(0, 4), 10), mo = parseInt(stamp.slice(5, 7), 10), d = parseInt(stamp.slice(8, 10), 10);
    var hh = parseInt(stamp.slice(11, 13), 10), mi = parseInt(stamp.slice(14, 16), 10), ss = parseInt(stamp.slice(17, 19), 10);
    var leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    var daysIn = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= daysIn[mo - 1] && hh < 24 && mi < 60 && ss < 60)) return null;
    var yy = y - (mo <= 2 ? 1 : 0), era = Math.floor(yy / 400), yoe = yy - era * 400; // days from civil
    var doy = Math.floor((153 * (mo + (mo > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    var days = era * 146097 + doe - 719468;
    return days * 86400 + hh * 3600 + mi * 60 + ss;
  }
  function cp(s) { return Array.from(s).map(function (c) { return c.codePointAt(0); }); }
  function cmpCP(a, b) {
    var x = cp(a), y = cp(b), i;
    for (i = 0; i < x.length && i < y.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return x.length - y.length;
  }
  function sortCP(list) { return list.slice().sort(cmpCP); }
  function dict() { return Object.create(null); }

  // ---- exact rationals ---------------------------------------------------
  function gcd(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function R(n, d) {
    n = BigInt(n); d = d === undefined ? 1n : BigInt(d);
    if (d < 0n) { n = -n; d = -d; }
    var g = gcd(n, d) || 1n;
    return { n: n / g, d: d / g };
  }
  function add(a, b) { return R(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return R(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return R(a.n * b.n, a.d * b.d); }
  function div(a, b) { return R(a.n * b.d, a.d * b.n); }
  function cmp(a, b) { var l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : (l > r ? 1 : 0); }
  function absR(a) { return a.n < 0n ? R(-a.n, a.d) : a; }
  function parseDec(s) {
    var m = /^(-?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(s);
    if (!m) throw new Error('number ' + s);
    var frac = m[3] || '', exp = parseInt(m[4] || '0', 10) - frac.length;
    var n = BigInt((m[2] || '0') + frac);
    if (m[1]) n = -n;
    return exp >= 0 ? R(n * (10n ** BigInt(exp))) : R(n, 10n ** BigInt(-exp));
  }
  function exact(x) { return parseDec(String(x)); }
  function isNumber(x) { return typeof x === 'number'; }
  function isCount(x) { return typeof x === 'number' && Number.isInteger(x); }
  function decimal(v, places) {
    var negative = v.n < 0n, mag = negative ? -v.n : v.n;
    var scale = 10n ** BigInt(places);
    var scaled = (mag * scale * 2n + v.d) / (v.d * 2n);
    var t = scaled.toString();
    if (places) {
      while (t.length < places + 1) t = '0' + t;
      t = t.slice(0, t.length - places) + '.' + t.slice(t.length - places);
    }
    if (negative && scaled) t = '-' + t;
    return t;
  }
  function plain(v) {
    var places = 0;
    while (R(v.n * 10n ** BigInt(places), v.d).d !== 1n) {
      places += 1;
      if (places > 400) throw new Error('non-terminating decimal');
    }
    var t = decimal(v, places);
    if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, '');
    return (t === '' || t === '-0') ? '0' : t;
  }
  function ratio(v) { return v.d === 1n ? v.n.toString() : v.n.toString() + '/' + v.d.toString(); }
  function pct(v) { return decimal(mul(v, R(100)), 6); }
  function usd(v) { return decimal(v, 2); }

  // ---- SHA-256 -------------------------------------------------------------
  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256Hex(bytes) {
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var len = bytes.length, total = Math.ceil((len + 9) / 64) * 64;
    var m = new Uint8Array(total), w = new Uint32Array(64), i, j;
    m.set(bytes); m[len] = 0x80;
    var bits = len * 8;
    for (i = 0; i < 8; i++) m[total - 1 - i] = Math.floor(bits / Math.pow(2, 8 * i)) & 0xff;
    for (j = 0; j < total; j += 64) {
      for (i = 0; i < 16; i++) w[i] = (m[j + 4 * i] << 24) | (m[j + 4 * i + 1] << 16) | (m[j + 4 * i + 2] << 8) | m[j + 4 * i + 3];
      for (i = 16; i < 64; i++) {
        var a0 = w[i - 15], a1 = w[i - 2];
        var s0 = ((a0 >>> 7) | (a0 << 25)) ^ ((a0 >>> 18) | (a0 << 14)) ^ (a0 >>> 3);
        var s1 = ((a1 >>> 17) | (a1 << 15)) ^ ((a1 >>> 19) | (a1 << 13)) ^ (a1 >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (k + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + k) >>> 0;
    }
    return h.map(function (x) { return ('00000000' + x.toString(16)).slice(-8); }).join('');
  }

  // ---- reading the file ---------------------------------------------------
  function checkRange(node) {
    if (typeof node === 'number') {
      if (!isFinite(node) || Math.abs(node) >= LIMIT) throw new Malformed('number-range');
    } else if (Array.isArray(node)) {
      node.forEach(checkRange);
    } else if (isObj(node)) {
      Object.keys(node).forEach(function (k) { checkRange(node[k]); });
    }
  }

  // Before parsing: brackets nested past MAX_DEPTH ('depth'), or a number written with more
  // than MAX_DIGITS significant digits ('precision'), whichever comes first.
  function scan(t) {
    var depth = 0, inString = false, escaped = false, i = 0, j, ch;
    while (i < t.length) {
      ch = t.charAt(i);
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
      } else if (ch === '"') {
        inString = true;
      } else if (ch === '[' || ch === '{') {
        depth += 1;
        if (depth > MAX_DEPTH) return 'depth';
      } else if (ch === ']' || ch === '}') {
        depth -= 1;
      } else if ('-0123456789'.indexOf(ch) >= 0) {
        j = i;
        while (j < t.length && '0123456789+-.eE'.indexOf(t.charAt(j)) >= 0) j += 1;
        var parts = t.slice(i, j).replace(/^-+/, '').split(/[eE]/), mantissa = parts[0];
        var significant = mantissa.replace(/\./g, '').replace(/^0+/, '').replace(/0+$/, '');
        if (significant.length > MAX_DIGITS) return 'precision';
        if (significant) {
          var exponent = parts.length > 1 ? parseInt(parts[1], 10) : 0;
          if (isNaN(exponent)) exponent = 0;
          var whole = mantissa.split('.')[0].replace(/^0+/, '');
          var fraction = mantissa.indexOf('.') >= 0 ? mantissa.split('.')[1] : '';
          var magnitude = (whole ? whole.length - 1 : -(fraction.length - fraction.replace(/^0+/, '').length + 1)) + exponent;
          if (magnitude < MIN_MAGNITUDE) return 'precision';
        }
        i = j;
        continue;
      }
      i += 1;
    }
    return null;
  }

  function parseManifest(t) {
    var entries = {};
    t.split(/\r\n|\r|\n/).forEach(function (line) {
      var parts = line.trim().split(/\s+/);
      if (parts.length === 2 && parts[0].length === 64) entries[parts[1]] = parts[0].toLowerCase();
    });
    return entries;
  }

  function signatureFields(node, path, found) {
    if (Array.isArray(node)) {
      node.forEach(function (child, index) { signatureFields(child, path + '/' + index, found); });
    } else if (isObj(node)) {
      Object.keys(node).forEach(function (key) {
        var here = path + '/' + key, lowered = key.toLowerCase();
        if (lowered.indexOf('signature') >= 0 || lowered.indexOf('inclusion') >= 0) found.push(here);
        signatureFields(node[key], here, found);
      });
    }
  }

  function recompute(bytes, manifest) {
    var digest = sha256Hex(bytes);
    var names = sortCP(Object.keys(manifest).filter(function (n) { return manifest[n] === digest; }));
    var fileInfo = { bytes: bytes.length, sha256: digest, manifest_name: names.length ? names[0] : null };
    var t, doc;
    try {
      t = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e) {
      return { kind: 'malformed', reason: 'utf-8', file: fileInfo };
    }
    var problem = scan(t);
    if (problem) return { kind: 'malformed', reason: problem, file: fileInfo };
    try {
      try { doc = JSON.parse(t); } catch (e) { throw new Malformed('json'); }
      checkRange(doc);
    } catch (e) {
      if (e instanceof Malformed) return { kind: 'malformed', reason: e.reason, file: fileInfo };
      return { kind: 'malformed', reason: 'json', file: fileInfo };
    }
    if (!isObj(doc) || !has(doc, 'sqcd1_vectors_version')) return { kind: 'unrecognized', reason: 'no-version', file: fileInfo };
    if (doc.sqcd1_vectors_version !== VECTORS_VERSION) return { kind: 'unrecognized', reason: 'version', file: fileInfo };
    var found = [];
    signatureFields(doc, '', found);
    found = sortCP(found);
    if (has(doc, 'cases')) return edgeCases(doc, fileInfo, found);
    if (has(doc, 'standard') && has(doc, 'events')) return workedMonth(doc, fileInfo, found);
    return { kind: 'unrecognized', reason: 'shape', file: fileInfo };
  }

  // ---- edge-cases.json ---------------------------------------------------------
  function edgeCases(doc, fileInfo, found) {
    var cases = doc.cases, listed = [], i;
    if (!Array.isArray(cases) || !cases.length) return { kind: 'unrecognized', reason: 'shape', file: fileInfo };
    for (i = 0; i < cases.length; i++) {
      var c = cases[i];
      if (!isObj(c) || !['id', 'clause', 'input', 'expect', 'must_not'].every(function (k) { return typeof get(c, k) === 'string' && get(c, k) !== ''; })) {
        return { kind: 'unrecognized', reason: 'shape', file: fileInfo };
      }
      listed.push({ id: c.id, clause: c.clause });
    }
    return { kind: 'edge-cases', version: VECTORS_VERSION, file: fileInfo,
      signature_fields: found, count: listed.length, cases: listed };
  }

  // ---- the worked month ----------------------------------------------------------
  function form(section) { return (isObj(section) && typeof get(section, 'form') === 'string' && section.form) ? section.form : null; }
  function pick(value, allowed, valid) {
    if (!inList(allowed, value) || valid === false) return false;
    return inList(UNREAD_PARAMETER, value) ? null : true;
  }
  function check(checks, id, clause, ok, value) { checks.push({ id: id, clause: clause, ok: ok, value: value }); }

  function tier(schedule, p) {
    if (!Array.isArray(schedule)) return null;
    for (var index = 0; index < schedule.length; index++) {
      var entry = schedule[index];
      if (!isObj(entry) || !isNumber(get(entry, 'credit'))) return null;
      var credit = exact(entry.credit);
      if (cmp(credit, R(0)) < 0 || cmp(credit, R(1)) > 0) return null;
      var hasFloor = has(entry, 'at_or_above'), hasCap = has(entry, 'below');
      if (hasFloor === hasCap) return null;
      var bound = hasFloor ? entry.at_or_above : entry.below;
      if (!isNumber(bound)) return null;
      bound = exact(bound);
      if ((hasFloor && cmp(p, bound) >= 0) || (hasCap && cmp(p, bound) < 0)) {
        return { index: index, credit: plain(credit), _credit: credit };
      }
    }
    return null;
  }

  function figure(fn, subjects, eligible, conforming, weights) {
    var ratios = subjects.map(function (s) { return R(conforming[s], eligible[s]); });
    if (fn === 'F-01') return div(ratios.reduce(add, R(0)), R(ratios.length));
    if (fn === 'F-02') {
      var total = subjects.reduce(function (acc, s) { return add(acc, weights[s]); }, R(0));
      var sum = subjects.reduce(function (acc, s, i) { return add(acc, mul(weights[s], ratios[i])); }, R(0));
      return div(sum, total);
    }
    if (fn === 'F-03') return ratios.reduce(function (m, r) { return cmp(r, m) < 0 ? r : m; });
    if (fn === 'F-04') {
      var c = 0, e = 0;
      subjects.forEach(function (s) { c += conforming[s]; e += eligible[s]; });
      return R(c, e);
    }
    throw new Error(fn);
  }

  function workedMonth(doc, fileInfo, found) {
    var std = doc.standard, events = doc.events;
    if (!isObj(std) || !isObj(events) || !Object.keys(events).length) return { kind: 'unrecognized', reason: 'shape', file: fileInfo };
    var checks = [];
    var out = { kind: 'worked-month', version: VECTORS_VERSION, file: fileInfo, checks: checks, stop: null };

    var fn = get(std, 'A2_period_function');
    check(checks, 'period-function', 'A2', text(fn) === null ? false : ((fn === 'F-04' || !inList(FUNCTIONS, fn)) ? null : true), text(fn)); // A2 lets a Filing Plan state other functions

    var hours = get(std, 'A3_window_hours'), intervalS = get(std, 'A3_sample_interval_s');
    var windowOk = isCount(hours) && isCount(intervalS) && hours > 0 && intervalS > 0 &&
      hours * 3600 < LIMIT && BigInt(hours) * 3600n % BigInt(intervalS) === 0n;
    var start = get(std, 'A3_window_start'), end = get(std, 'A3_window_end');
    if (start !== null || end !== null) { // stated bounds must span the stated hours
      var t0 = epoch(start), t1 = epoch(end);
      windowOk = windowOk && t0 !== null && t1 !== null && t1 - t0 === hours * 3600;
    }
    var windowGiven = isNumber(hours) && isNumber(intervalS);
    // outside the page's range is unread, not a breach
    check(checks, 'window', 'A3', windowOk ? true : (windowGiven ? null : false), { hours: isCount(hours) ? hours : null, sample_interval_s: isCount(intervalS) ? intervalS : null,
      start: epoch(start) !== null ? start : null, end: epoch(end) !== null ? end : null });

    var materiality = form(get(std, 'A6_materiality'));
    var mtSection = get(std, 'A6_materiality');
    var mtParam = isObj(mtSection) ? get(mtSection, 'parameter_intervals') : null;
    var mtState = pick(materiality, MATERIALITY);
    if (materiality === 'MT-02' && mtState && !(isCount(mtParam) && mtParam >= 0)) mtState = null; // no parameter read as a count
    var plans = get(std, 'G3_filing_plan_sample_interval_s'), a3s = get(std, 'A3_sample_interval_s');
    if (materiality === 'MT-02' && mtState && isObj(plans) &&   // 2.2.1: every Filing Plan samples at the A3 interval
        !PARTIES.every(function (p) { return isNumber(get(plans, p)) && isNumber(a3s) && cmp(exact(plans[p]), exact(a3s)) === 0; })) mtState = false;
    check(checks, 'materiality', 'A6', mtState, materiality);
    var ceiling = form(get(std, 'A6_unresolved_ceiling'));
    var ucSection = get(std, 'A6_unresolved_ceiling');
    var ucParam = isObj(ucSection) ? get(ucSection, 'parameter_pct') : null;
    var ucState = pick(ceiling, CEILINGS);
    if ((ceiling === 'UC-01' || ceiling === 'UC-03') && ucState && !(isNumber(ucParam) && ucParam >= 0)) ucState = null; // no parameter read as a share >= 0
    check(checks, 'unresolved-ceiling', 'A6', ucState, ceiling);

    var layers = get(std, 'B7_covered_layers');
    var layersOk = Array.isArray(layers) && layers.length > 0 &&
      layers.every(function (l) { return inList(LAYERS, l); }) && layers.indexOf('L8') < 0;
    check(checks, 'covered-layers', 'B7', layersOk,
      (Array.isArray(layers) && layers.every(function (l) { return typeof l === 'string'; })) ? layers.slice() : null);

    var substitution = get(std, 'A9_substitution');
    check(checks, 'substitution', 'A9', text(substitution) === null ? null : pick(substitution, SUBSTITUTION), text(substitution)); // A9.2 needs a factor only where netting is permitted
    var resolution = get(std, 'H4_divergence_resolution');
    check(checks, 'divergence-resolution', 'H4', pick(resolution, RESOLUTION), text(resolution));
    var expiry = get(std, 'I11_expiry_pricing');
    check(checks, 'expiry-pricing', 'I.1.1', pick(expiry, EXPIRY), text(expiry));
    var faultForm = form(get(std, 'J1_evidence_fault'));
    check(checks, 'evidence-fault', 'J1', (faultForm === 'EF-01' || faultForm === 'EF-02' || faultForm === 'EF-03') ? null : pick(faultForm, FAULTS), faultForm); // 2.5.1 turns on an evidence holder the layout omits

    // -- events
    var names = sortCP(Object.keys(events));
    var parsed = [], eventsOk = true, causeMissing = false, causeOutside = false, anyDeclared = false, i;
    for (i = 0; i < names.length; i++) {
      var name = names[i], ev = events[name];
      if (!isObj(ev) || !name) { eventsOk = false; break; }
      var subj = get(ev, 'subjects'), count = get(ev, 'intervals'), kind = get(ev, 'class');
      if (!Array.isArray(subj) || !subj.length || !subj.every(function (s) { return typeof s === 'string' && s; }) ||
          new Set(subj).size !== subj.length || !isCount(count) || count <= 0 || !inList(CLASSES, kind)) {
        eventsOk = false; break;
      }
      var item = { name: name, subjects: subj.slice(), intervals: count, 'class': kind };
      if (kind === 'unresolved') {
        var declared = has(ev, 'declared_by') ? ev.declared_by : [];
        if (!Array.isArray(declared) || !declared.every(function (p) { return inList(PARTIES, p); })) { eventsOk = false; break; }
        item.declared_by = PARTIES.filter(function (p) { return declared.indexOf(p) >= 0; });
        if (item.declared_by.length) {
          anyDeclared = true;
          if (get(ev, 'cause') === null || get(ev, 'cause') === '') causeMissing = true;
          else if (!inList(CAUSES, ev.cause)) causeOutside = true;
        }
      } else if (kind === 'unilateral') {
        var observer = get(ev, 'observed_by');
        if (!inList(PARTIES, observer)) { eventsOk = false; break; }
        var otherParty = observer === 'operator' ? 'customer' : 'operator';
        var reading = get(ev, observer + '_reading'), gap = get(ev, otherParty + '_declared_gap');
        if ((reading !== null && !inList(READINGS, reading)) || (gap !== null && typeof gap !== 'boolean')) { eventsOk = false; break; }
        item.observed_by = observer;
        item.reading = reading;
        item.declared_gap = gap;
      } else if (kind === 'non-conforming' || kind === 'disputed') {
        if (!inList(LAYERS, get(ev, 'layer'))) { eventsOk = false; break; }
        item.layer = ev.layer;
        if (kind === 'non-conforming' && (has(ev, 'agreed') ? ev.agreed : true) !== true) { eventsOk = false; break; }
        if (kind === 'disputed') {
          var first = get(ev, 'first_interval');
          if (first !== null && !(typeof first === 'string' && UTC_SECOND.test(first))) { eventsOk = false; break; }
          item.first_interval = first;
          var opReading = get(ev, 'operator_reading'), cuReading = get(ev, 'customer_reading');
          if ([opReading, cuReading].some(function (r) { return r !== null && !inList(READINGS, r); })) { eventsOk = false; break; }
          item.readings = { operator: opReading, customer: cuReading };
        }
      }
      parsed.push(item);
    }

    var listed = get(std, 'B3_subjects');
    if (listed !== null && !(Array.isArray(listed) && listed.length &&
        listed.every(function (s) { return typeof s === 'string' && s; }) && new Set(listed).size === listed.length)) eventsOk = false;
    if (eventsOk && listed !== null) {
      eventsOk = parsed.every(function (it) { return it.subjects.every(function (s) { return listed.indexOf(s) >= 0; }); });
    }
    var subjects = [];
    if (eventsOk) {
      if (listed !== null) {
        subjects = sortCP(listed);
      } else {
        var seen = dict();
        parsed.forEach(function (it) { it.subjects.forEach(function (s) { seen[s] = s; }); });
        subjects = sortCP(Object.keys(seen).map(function (k) { return seen[k]; }));
      }
    }
    var n = windowOk ? Number(BigInt(hours) * 3600n / BigInt(intervalS)) : 0;
    if (eventsOk && windowOk) {
      var used = dict();
      subjects.forEach(function (s) { used[s] = 0; });
      parsed.forEach(function (it) { it.subjects.forEach(function (s) { used[s] += it.intervals; }); });
      eventsOk = subjects.every(function (s) { return used[s] <= n; }) && n * subjects.length < LIMIT;
    }
    check(checks, 'events', 'Annex 3.2', windowOk ? eventsOk : (eventsOk ? null : false),
      eventsOk ? { events: names.length, subjects: subjects.length } : null);
    if (anyDeclared && parsed.length === names.length) {
      var problem = causeOutside ? 'outside' : (causeMissing ? 'missing' : null);
      check(checks, 'causes', 'C2', problem === null, problem);
    }
    check(checks, 'signatures', 'D4 · E2', null, found);

    try {
      ['period-function', 'window', 'covered-layers', 'events'].forEach(function (id) {
        var entry = checks.filter(function (c) { return c.id === id; })[0];
        if (entry.ok === false || (id === 'window' && !windowOk)) throw new Stop(id);
      });
      if (!inList(RECOMPUTED_FUNCTIONS, fn)) throw new Stop('period-function');
      recomputeMonth(out, std, parsed, subjects, n, fn, listed !== null, materiality, ceiling, faultForm, resolution, layers, doc);
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
      out.stop = e.check;
    }
    return out;
  }

  function perSubject(subjects, v) { var o = dict(); subjects.forEach(function (s) { o[s] = v; }); return o; }

  function recomputeMonth(out, std, parsed, subjects, n, fn, subjectsListed, materiality, ceiling, faultForm, resolution, layers, doc) {
    var readings = (subjectsListed ? [] : ['subjects']).concat(['eachSubject', 'disjoint', 'observed']).concat(fn === 'F-02' ? ['weights'] : []);
    var excluded = perSubject(subjects, 0), unresolved = perSubject(subjects, 0), unilateral = perSubject(subjects, 0);
    var nonconf = { operator: perSubject(subjects, 0), customer: perSubject(subjects, 0) };
    var faults = [], parting = [], firsts = [], firstComplete = true;
    var shortfall = { agreed: 0, disputed: 0 }; // Annex 3.8: non-conforming in both figures, or in one

    if (parsed.some(function (i) { return i['class'] === 'disputed' && layers.indexOf(i.layer) >= 0 &&
        ((i.readings.operator || 'conforming') === 'conforming' || (i.readings.customer || 'non-conforming') === 'conforming'); })) readings.push('layer'); // B7.2: one Layer's reading answers for that Layer only
    if (parsed.some(function (i) { return i['class'] === 'unilateral' || i['class'] === 'unresolved'; })) readings.push('required');
    if (parsed.some(function (i) { return i['class'] === 'unilateral' && i.declared_gap === null; })) readings.push('undeclared');
    if (parsed.some(function (i) { return i['class'] === 'unilateral' && i.reading === null; })) readings.push('unilateral');
    if (parsed.some(function (i) { return i['class'] === 'disputed' && layers.indexOf(i.layer) >= 0 &&
        (i.readings.operator === null || i.readings.customer === null); })) readings.push('disputed');

    parsed.forEach(function (item) {
      var kind = item['class'], count = item.intervals, span = count * item.subjects.length;
      if (kind === 'A4-exclusion') {
        item.subjects.forEach(function (s) { excluded[s] += count; });
      } else if (kind === 'unresolved') {
        var missing = PARTIES.filter(function (p) { return item.declared_by.indexOf(p) < 0; });
        if (missing.length && faultForm !== 'EF-04' && faultForm !== 'EF-05') throw new Stop('evidence-fault');
        item.subjects.forEach(function (s) { unresolved[s] += count; });
        missing.forEach(function (party) {
          faults.push({ event: item.name, party: party, clause: 'C5.5', subject_intervals: span });
        });
      } else if (kind === 'unilateral') {
        if (faultForm !== 'EF-04') throw new Stop('evidence-fault');
        item.subjects.forEach(function (s) {
          unilateral[s] += count;
          if (item.reading === 'non-conforming') PARTIES.forEach(function (party) { nonconf[party][s] += count; }); // the observation that exists determines
        });
        if (item.reading === 'non-conforming') shortfall.agreed += span;
        var other = item.observed_by === 'operator' ? 'customer' : 'operator';
        if (item.declared_gap !== true) faults.push({ event: item.name, party: other, clause: 'C5.4', subject_intervals: span });
      } else if (kind === 'non-conforming') {
        if (layers.indexOf(item.layer) >= 0) {
          PARTIES.forEach(function (party) { item.subjects.forEach(function (s) { nonconf[party][s] += count; }); });
          shortfall.agreed += span;
        }
      } else if (kind === 'disputed') {
        if (layers.indexOf(item.layer) >= 0) {
          var said = { operator: item.readings.operator || 'conforming', customer: item.readings.customer || 'non-conforming' }; // Annex 3.2 E5 where the file is silent
          PARTIES.forEach(function (party) {
            if (said[party] === 'non-conforming') item.subjects.forEach(function (s) { nonconf[party][s] += count; });
          });
          if (said.operator === 'non-conforming' && said.customer === 'non-conforming') shortfall.agreed += span;
          if (said.operator !== said.customer) {
            shortfall.disputed += span;
            parting.push({ event: item.name, layer: item.layer, subjects: sortCP(item.subjects) });
            if (item.first_interval === null) firstComplete = false; else firsts.push(item.first_interval);
          }
        }
      }
    });

    var eligible = dict();
    subjects.forEach(function (s) { eligible[s] = n - excluded[s] - unresolved[s]; });
    if (subjects.some(function (s) { return eligible[s] <= 0; })) throw new Stop('eligible');
    var conforming = { operator: dict(), customer: dict() };
    PARTIES.forEach(function (p) { subjects.forEach(function (s) { conforming[p][s] = eligible[s] - nonconf[p][s]; }); });

    var sumOf = function (o) { return subjects.reduce(function (acc, s) { return acc + o[s]; }, 0); };
    var total = n * subjects.length;
    var a4 = sumOf(excluded);
    var beforeC5 = total - a4;
    var unresolvedTotal = sumOf(unresolved);
    var eligibleTotal = beforeC5 - unresolvedTotal;
    var unilateralTotal = sumOf(unilateral);
    var unresolvedFraction = R(unresolvedTotal, beforeC5);
    var unilateralFraction = R(unilateralTotal, beforeC5);

    out.readings = readings;
    out.faults = faults;
    out.denominators = {
      intervals_per_subject: n, subjects: subjects.length,
      total_subject_intervals: total, a4_exclusions: a4,
      eligible_before_C5: beforeC5, unresolved: unresolvedTotal,
      eligible: eligibleTotal, unilateral: unilateralTotal };
    out.shortfall = { agreed_intervals: shortfall.agreed, disputed_intervals: shortfall.disputed };
    out.per_subject = subjects.map(function (s) {
      var row = { id: s, eligible: eligible[s], conforming: {}, ratio: {}, pct: {} };
      PARTIES.forEach(function (p) {
        row.conforming[p] = conforming[p][s];
        row.ratio[p] = ratio(R(conforming[p][s], eligible[s]));
        row.pct[p] = pct(R(conforming[p][s], eligible[s]));
      });
      return row;
    });
    out.fractions = {
      unresolved: { ratio: ratio(unresolvedFraction), pct: pct(unresolvedFraction) },
      unilateral: { ratio: ratio(unilateralFraction), pct: pct(unilateralFraction) } };

    var accelerators = get(std, 'A8_accelerators_per_subject');
    var weight = (isNumber(accelerators) && accelerators > 0) ? exact(accelerators) : R(1);
    var weights = dict();
    subjects.forEach(function (s) { weights[s] = weight; });

    var figures = {};
    PARTIES.forEach(function (p) { figures[p] = figure(fn, subjects, eligible, conforming[p], weights); });
    out.period_figures = { 'function': fn };
    PARTIES.forEach(function (p) { out.period_figures[p] = { ratio: ratio(figures[p]), pct: pct(figures[p]) }; });

    // -- ceiling (A6, C5.3)
    var ceilingSection = get(std, 'A6_unresolved_ceiling');
    var parameter = isObj(ceilingSection) ? get(ceilingSection, 'parameter_pct') : null;
    var within = null, parameterText = null, worstSubjects = null, worstPct = null;
    if (ceiling === 'UC-04') {
      within = true;
    } else if ((ceiling === 'UC-01' || ceiling === 'UC-03') && isNumber(parameter) && parameter >= 0) {
      var limit = div(exact(parameter), R(100));
      parameterText = plain(exact(parameter));
      if (ceiling === 'UC-01') {
        within = cmp(unresolvedFraction, limit) <= 0;
      } else {
        var shares = subjects.filter(function (s) { return n - excluded[s] > 0; }).map(function (s) {
          return { share: R(unresolved[s], n - excluded[s]), s: s };
        });
        var top = shares.reduce(function (m, x) { return cmp(x.share, m) > 0 ? x.share : m; }, R(0));
        worstSubjects = shares.filter(function (x) { return cmp(x.share, top) === 0; }).map(function (x) { return x.s; });
        worstPct = pct(top);
        within = cmp(top, limit) <= 0;
      }
    }
    out.ceiling = { form: ceiling, parameter_pct: parameterText, within: within, subjects: worstSubjects, subject_pct: worstPct };

    // -- divergence (H)
    var divergence = absR(sub(figures.operator, figures.customer));
    var bySubject = dict();
    subjects.forEach(function (s) { bySubject[s] = Math.abs(conforming.operator[s] - conforming.customer[s]); });
    var widest = subjects.reduce(function (m, s) { return bySubject[s] > m ? bySubject[s] : m; }, 0);
    var widestSubjects = widest ? subjects.filter(function (s) { return bySubject[s] === widest; }) : [];
    var material = null, threshold = null;
    var materialitySection = get(std, 'A6_materiality');
    if (materiality === 'MT-02') {
      var quantity = isObj(materialitySection) ? get(materialitySection, 'parameter_intervals') : null;
      if (isCount(quantity) && quantity >= 0) {
        threshold = quantity;
        material = widest > threshold; // 2.2.1: the difference on any one subject
      }
    } else if (materiality === 'MT-05') {
      threshold = 0;
      material = cmp(divergence, R(0)) > 0;
    }
    var firstInterval = (material === true && firsts.length && firstComplete) ? firsts.reduce(function (m, x) { return cmpCP(x, m) < 0 ? x : m; }) : null;
    out.divergence = {
      pp: pct(divergence), ratio: ratio(divergence),
      widest_subject_intervals: widest, widest_subjects: widestSubjects,
      materiality: materiality, threshold_intervals: threshold,
      material: material,
      first_interval: firstInterval,
      first_interval_complete: material === true ? firstComplete : null,
      parting: material === true ? parting : [],
      resolution: text(resolution) };
    out.sigma_output = (material === true && resolution === 'DR-06') ? 'requires-review' : null;
    if (out.sigma_output === 'requires-review') out.readings.push('sigma'); // Annex 3.5: DR-06 returns requires-review
    out.terminal_state = null;

    // -- money (A7)
    var price = get(std, 'price_per_accelerator_hour_usd');
    var schedule = get(std, 'A7_remedy_schedule');
    var money = { fee_usd: null, held: null };
    var fee = null;
    if (isNumber(price) && price > 0 && isNumber(accelerators) && accelerators > 0) {
      var hoursR = R(std.A3_window_hours);
      var accHours = mul(mul(R(subjects.length), exact(accelerators)), hoursR);
      fee = mul(accHours, exact(price));
      money.fee_usd = usd(fee);
      money.accelerator_hours = plain(accHours);
      money.price_usd = plain(exact(price));
      out.readings.push('feeBase'); // Annex 3.1: credits are shares of the Window fee
    }
    if (within !== true) money.held = within === false ? 'C5.3' : 'ceiling';

    function quote(f) {
      var t = tier(schedule, mul(f, R(100)));
      var entry = { tier: t ? t.index : null, credit: t ? t.credit : null, usd: null };
      if (t && fee !== null && money.held === null) entry.usd = usd(mul(t._credit, fee));
      return entry;
    }
    PARTIES.forEach(function (p) { money[p] = quote(figures[p]); });
    if (PARTIES.some(function (p) { return money[p].tier !== null; })) out.readings.push('bands'); // Annex 3.1: A7 bounds in percent, first tier met
    var quoted = PARTIES.map(function (p) { return money[p].usd; });
    money.disputed_usd = quoted.indexOf(null) < 0 ? usd(absR(sub(parseDec(quoted[1]), parseDec(quoted[0])))) : null;
    out.money = money;

    // -- Annex 3.7 alternates
    out.alternates = ALTERNATES.map(function (alt) {
      var row = { 'function': alt };
      PARTIES.forEach(function (p) {
        var f = figure(alt, subjects, eligible, conforming[p], weights);
        var q = quote(f);
        row[p] = { pct: pct(f), tier: q.tier, credit: q.credit, usd: q.usd };
      });
      return row;
    });

    out.comparison = compare(doc, out);
  }

  function filed(value) {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (isNumber(value)) return plain(exact(value));
    if (typeof value === 'string') return value;
    if (isObj(value)) {
      return sortCP(Object.keys(value)).map(function (k) { return k + ' ' + filed(value[k]); }).join(', ');
    }
    return '[list]';
  }

  // A subject's conforming / eligible ratio, rounded half up to eight decimals (Annex 3.4).
  function availability(row, party) { return decimal(R(row.conforming[party], row.eligible), 8); }

  function sameNumber(recomputed, f) {
    if (recomputed === null) return false;
    if (!isNumber(f)) return false;
    return cmp(parseDec(recomputed), exact(f)) === 0;
  }

  function compare(doc, out) {
    var rows = [], expected = get(doc, 'expected'), den = out.denominators;
    if (isObj(expected)) {
      var m = out.divergence.material;
      var recomputed = {
        intervals_per_subject: String(den.intervals_per_subject),
        total_subject_intervals: String(den.total_subject_intervals),
        unilateral: String(den.unilateral),
        disputed_amount_usd: has(out.money, 'disputed_usd') ? out.money.disputed_usd : null,
        a4_exclusions: String(den.a4_exclusions),
        eligible_before_C5: String(den.eligible_before_C5),
        unresolved: String(den.unresolved),
        eligible: String(den.eligible),
        per_subject_eligible: out.per_subject.map(function (r) { return r.id + ' ' + r.eligible; }).join(', '),
        per_subject_availability_operator: out.per_subject.map(function (r) { return r.id + ' ' + availability(r, 'operator'); }).join(', '),
        per_subject_availability_customer: out.per_subject.map(function (r) { return r.id + ' ' + availability(r, 'customer'); }).join(', '),
        window_accelerator_hours: has(out.money, 'accelerator_hours') ? out.money.accelerator_hours : null,
        unresolved_fraction_pct: out.fractions.unresolved.pct,
        unilateral_fraction_pct: out.fractions.unilateral.pct,
        unresolved_within_ceiling: out.ceiling.within === null ? null : (out.ceiling.within ? 'true' : 'false'),
        shortfall_intervals_agreed: String(out.shortfall.agreed_intervals),
        shortfall_intervals_disputed: String(out.shortfall.disputed_intervals),
        period_figure_operator_pct: out.period_figures.operator.pct,
        period_figure_customer_pct: out.period_figures.customer.pct,
        divergence_pp: out.divergence.pp,
        divergence_material: m === null ? null : (m ? 'true' : 'false'),
        first_diverging_interval: out.divergence.first_interval,
        window_fee_usd: out.money.fee_usd,
        credit_operator_usd: out.money.operator.usd,
        credit_customer_usd: out.money.customer.usd,
        sigma_output: out.sigma_output || 'null',
        terminal_state: 'null' };
      var numeric = ['intervals_per_subject', 'unilateral', 'disputed_amount_usd',
        'total_subject_intervals', 'a4_exclusions', 'eligible_before_C5',
        'unresolved', 'eligible', 'unresolved_fraction_pct', 'unilateral_fraction_pct',
        'period_figure_operator_pct', 'period_figure_customer_pct', 'divergence_pp',
        'window_accelerator_hours', 'window_fee_usd', 'shortfall_intervals_agreed', 'shortfall_intervals_disputed',
        'credit_operator_usd', 'credit_customer_usd'];
      var keys = EXPECTED_ORDER.filter(function (k) { return has(expected, k); }).concat(
        sortCP(Object.keys(expected).filter(function (k) { return EXPECTED_ORDER.indexOf(k) < 0; })));
      keys.forEach(function (key) {
        var f = expected[key];
        var row = { block: 'expected', key: key, filed: filed(f), recomputed: null, match: null };
        if (key === 'terminal_state_note') {
          row.recomputed = null;
        } else if (numeric.indexOf(key) >= 0) {
          row.recomputed = recomputed[key];
          row.match = sameNumber(recomputed[key], f);
        } else if (key.indexOf('per_subject_availability_') === 0) {
          var party = key.slice('per_subject_availability_'.length);
          row.recomputed = recomputed[key];
          var pids = out.per_subject.map(function (r) { return r.id; });
          row.match = isObj(f) && JSON.stringify(sortCP(Object.keys(f))) === JSON.stringify(pids) &&
            out.per_subject.every(function (r) { return isNumber(f[r.id]) && cmp(exact(f[r.id]), parseDec(availability(r, party))) === 0; });
        } else if (key === 'per_subject_eligible') {
          row.recomputed = recomputed[key];
          var ids = out.per_subject.map(function (r) { return r.id; });
          row.match = isObj(f) && JSON.stringify(sortCP(Object.keys(f))) === JSON.stringify(ids) &&
            out.per_subject.every(function (r) { return isNumber(f[r.id]) && cmp(exact(f[r.id]), R(r.eligible)) === 0; });
        } else if (has(recomputed, key)) {
          row.recomputed = recomputed[key] !== null ? recomputed[key] : 'null';
          row.match = row.recomputed === row.filed;
        }
        rows.push(row);
      });
    }
    var alternates = get(doc, 'alternate_period_functions');
    if (isObj(alternates)) {
      var byFunction = {};
      out.alternates.forEach(function (r) { byFunction[r['function']] = r; });
      sortCP(Object.keys(alternates)).forEach(function (key) {
        var f = alternates[key];
        var row = { block: 'alternate_period_functions', key: key, filed: filed(f), recomputed: null, match: null };
        var chars = Array.from(key), head = chars.slice(0, 4).join('');
        if (has(byFunction, head) && chars.slice(4, 5).join('') === '_') {
          if (key.indexOf('_operator_') < 0 && key.indexOf('_customer_') < 0 &&
              out.readings.indexOf('partyless') < 0) out.readings.push('partyless'); // Annex 3.7: the operator's figure
          var alt = byFunction[head][key.indexOf('_customer_') >= 0 ? 'customer' : 'operator'];
          var credit = key.indexOf('_credit') >= 0 && /_usd$/.test(key);
          if (credit) row.recomputed = alt.usd;
          else if (/_pct$/.test(key)) row.recomputed = alt.pct;
          if (row.recomputed !== null || credit || /_pct$/.test(key)) row.match = sameNumber(row.recomputed, f);
        }
        rows.push(row);
      });
    }
    return rows;
  }

  root.SQCD1 = { recompute: recompute, sha256Hex: sha256Hex, parseManifest: parseManifest };
})(typeof window !== 'undefined' ? window : this);
