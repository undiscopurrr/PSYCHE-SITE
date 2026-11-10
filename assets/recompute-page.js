/* The recompute page: opens one of the two bundled SQCD-1 conformance vectors, runs
 * SQCD1.recompute from recompute.js on its bytes and sets out the result. Every sentence
 * the page shows lives in T. A state the bundled vectors do not produce raises an error,
 * so a rebuilt vector that needs a new sentence fails tests/test_recompute_page.py. */
(function () {
  'use strict';

  var T = {
    // section labels (left, right)
    secFile: 'The file', secFileR: '{name} · {n} bytes',
    secChecks: 'Checks', secChecksR: '{m} of {n} pass',
    secDen: 'Denominators', secDenR: 'Annex 3.3',
    secFig: 'The two Period Figures', secFigR: '{f} · A2',
    secDiv: 'Divergence', secDivR: 'H4',
    secMoney: 'The money', secMoneyR: 'A7',
    secAlt: 'Under a different function', secAltR: 'Annex 3.7',
    secCmp: 'Against the vector',
    secReadings: 'Readings', secReadingsR: 'Annex 3',
    secCases: 'Edge cases', secCasesR: 'Annex 9',
    // the file
    fileMatch: 'The SHA-256 matches {name} in MANIFEST.sha256, the manifest Annex 9 publishes with SQCD-1.',
    view: 'View the file', sha: 'SHA-256',
    // checks
    a2Ok: 'A2 names {v}, an Annex 2.1 period function.',
    a3Ok: 'A3 sets the Window from {start} to {end}, {h} hours in all, sampled every {s} seconds into {n} intervals for each Measured Subject.',
    pickOk: '{clause} selects {v} from Annex {annex}.',
    pickMt02: 'A6 selects MT-02 from Annex 2.2, at {n} intervals on one Measured Subject, and both Filing Plans sample at the A3 interval of {s} seconds.',
    pickUc: 'A6 selects {v} from Annex 2.3, at {p} %.',
    b7Ok: 'B7 covers {list}, and L8 stays outside, as Annex 8 row 14 requires.',
    eventsOk: 'The file holds {e} events across {s} Measured Subjects, and each subject’s event interval counts sum to at most the intervals its Window holds.',
    causesOk: 'Every declared gap names a cause from the C2 vocabulary.',
    sigNone: 'No field name in the file contains “signature” or “inclusion”, the words D4 and E2 use.',
    // readings
    readLead: 'The page reads these inputs from Annex 3 and from the prose of the vector’s note.',
    eachSubject: 'An event’s interval count applies to each Measured Subject it lists, as in Annex 3.2.',
    disjoint: 'Each interval belongs to one event at most, as the vector’s note states.',
    observed: 'Every subject-interval outside the events was observed by both Filing Parties and is conforming at every covered Layer, as the vector’s note states.',
    layer: '{event} spans {n} intervals on {subject}, and the {party}’s conforming reading there covers every covered Layer, as Annex 3.4 shows.',
    sigma: 'Under DR-06 the evaluation returns requires-review on a material Divergence, as in Annex 3.5.',
    partyless: 'Each key under alternate_period_functions that names no party belongs to the provider’s filing, as in Annex 3.7’s table.',
    bands: 'The A7 schedule’s bounds apply to the Period Figure in percent, and its tiers are the bands of Annex 3.1: a figure takes the first tier, in the schedule’s order, whose bound it meets.',
    feeBase: 'Each credit is its tier’s share of the Window fee, and the Window fee charges every Measured Subject’s accelerators for every hour of the Window at the price per accelerator-hour, as in Annex 3.1.',
    required: 'Both Filing Plans required the observations missing in {unresolved}, and the {party}’s Filing Plan required those missing in {unilateral}, as Annex 3.3 states.',
    // denominators
    perSubjectN: 'Intervals per subject: {h} h × 3600 ÷ {s} = {n}.',
    totalN: 'Total subject-intervals: {k} × {n} = {t}.',
    dTotal: 'Total subject-intervals', dA4: 'less A4 exclusions', dBefore: 'Eligible before C5',
    dUnres: 'less Unresolved', dElig: 'Eligible', dPer: 'Per subject',
    ufLine: 'Unresolved Fraction = {u} ÷ {b} = {pct} %.',
    ufWithin: 'The fraction is within the {p} % ceiling under {form}.',
    ulLine: 'Unilateral Fraction = {u} ÷ {b} = {pct} %, stated as 4.4 requires.',
    faultC54: '{event} is unilateral: only the {other} observed. C5.4 attributes its {n} subject-intervals to the {party}, and under EF-04 the {other}’s record, conforming, determines them.',
    // period figures
    'F-01': 'F-01 · Time-weighted availability, which Annex 2.1 defines as “Conforming interval-seconds divided by eligible interval-seconds in the Window, per Measured Subject, arithmetic mean across subjects.”',
    operator: 'Provider', customer: 'Customer',
    perSubjectHead: 'Per subject, conforming ÷ eligible',
    // divergence
    divLine: 'Divergence = {pp} percentage points.',
    mt02Material: 'The two filings differ most on {subjects}, by {w} intervals. Materiality is MT-02 at {t} intervals on one Measured Subject, so the Divergence is material.',
    h5: 'A Divergence Event arises from the arithmetic.',
    hBoth: 'Both Period Figures', hFirst: 'First diverging interval',
    hLayer: 'Layer and subject', hUf: 'Unresolved Fraction, each party',
    dr06: 'Under DR-06 the evaluation records the conflict, carries it forward and returns requires-review.',
    // money
    fee: 'Window fee: {k} subjects × {a} accelerators × {h} h = {ah} accelerator-hours × ${price} = ${fee}.',
    opFiling: 'Provider’s filing', cuFiling: 'Customer’s filing',
    disputedAmt: 'The disputed amount is ${d}.',
    carried: 'Both quotes are computed and both are carried. The amount owed follows a decision signed under F2, or, where none is filed by the review deadline, the expiry pricing selected under I.1.1.',
    // alternates
    altLead: 'A2 required the function to be named, and A10 committed it before the Window opened. The rows below give the provider’s figure under three functions.',
    'alt-F-01': 'time-weighted, mean across subjects', 'alt-F-04': 'aggregate, subject-seconds pooled, with B3 naming the aggregate', 'alt-F-03': 'worst subject',
    // comparison
    cmpLead: 'Each row sets a value the vector states beside the page’s own value, where the page has one.',
    cmpCount: '{m} of {n} match', cmpRc: 'Page', cmpFd: 'Vector',
    // edge cases
    casesLead: 'The file holds {count} cases, and each states an input, the outcome it expects, the clause it tests and what a conforming implementation MUST NOT return.',
    cInput: 'Input', cExpect: 'Expect', cMust: 'Must not'
  };
  var NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
  var ANNEX = { materiality: '2.2', 'unresolved-ceiling': '2.3', 'expiry-pricing': '2.4', 'evidence-fault': '2.5', substitution: '2.6', 'divergence-resolution': '2.7' };

  var V = window.SQCD1_VECTORS, MANIFEST = SQCD1.parseManifest(V.manifest);
  var resultEl = document.getElementById('result');
  var order = 0;

  function need(ok, what) { if (!ok) throw new Error('recompute page: the bundled vector reaches an unworded state: ' + what); }

  // ---- formatting ---------------------------------------------------------------
  var NB = ' ';
  function fill(t, v) {
    need(typeof t === 'string', 'a missing sentence');
    return t.replace(/\{(\w+)\}/g, function (m, k) { need(v[k] !== undefined && v[k] !== null, 'a missing value ' + k); return v[k]; });
  }
  function group(s) {
    var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var parts = s.split('.'), i = parts[0], out = '';
    while (i.length > 3) { out = NB + i.slice(-3) + out; i = i.slice(0, -3); }
    return (neg ? '−' : '') + i + out + (parts.length > 1 ? '.' + parts[1] : '');
  }
  function shift(s, k) { // decimal string times 10^k, plain
    var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var p = s.split('.'), digits = p[0] + (p[1] || ''), point = p[0].length + k;
    while (digits.length < point) digits += '0';
    while (point <= 0) { digits = '0' + digits; point += 1; }
    var r = digits.slice(0, point).replace(/^0+(?=\d)/, '') + (digits.slice(point) ? '.' + digits.slice(point) : '');
    r = r.indexOf('.') >= 0 ? r.replace(/0+$/, '').replace(/\.$/, '') : r;
    return (neg ? '-' : '') + r;
  }
  function plainNum(x) { var m = String(x).split(/e/i); return shift(m[0], m.length > 1 ? parseInt(m[1], 10) : 0); }
  function two(s) { var p = String(s).split('.'); var f = (p[1] || ''); while (f.length < 2) f += '0'; return p[0] + '.' + f; }
  function money(s) { return '$' + group(two(s)); }
  function pc(s) { return group(s) + NB + '%'; }
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  var WHO = { operator: 'provider', customer: 'customer' };   // SQCD-1 names the parties provider and customer; the vector keys say operator
  function word(n) {
    if (n < NUM.length) return NUM[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NUM[n % 10].toLowerCase() : '');
    return String(n);
  }
  function listing(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  // ---- DOM ------------------------------------------------------------------------
  function h(tag, cls, kids) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    (kids || []).forEach(function (k) { if (k !== null && k !== undefined) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return e;
  }
  function reveal(e) { e.classList.add('rv'); e.style.animationDelay = Math.min(order++ * 45, 1800) + 'ms'; return e; }
  function p(text, cls) { return reveal(h('p', cls || 'r-p', [text])); }
  function section(left, right, kids) {
    return h('section', 'r-sec', [h('div', 'sec-label', [h('span', null, [left]), h('span', null, [right || ''])])].concat(kids));
  }
  function mark(ok) { return h('span', 'mk ' + (ok === true ? 'ok' : 'na'), [ok === true ? '✓' : '·']); }
  function line(label, value, cls) { return reveal(h('div', 'r-line ' + (cls || ''), [h('span', 'k', [label]), h('span', 'v', [value])])); }

  // ---- the file -------------------------------------------------------------------------
  function fileSection(res, name, textBody) {
    need(res.file.manifest_name === name, 'a digest outside MANIFEST.sha256');
    return section(T.secFile, fill(T.secFileR, { name: name, n: group(String(res.file.bytes)) }), [
      reveal(h('p', 'r-digest', [h('span', 'k', [T.sha]), ' ', h('span', 'd', [res.file.sha256])])),
      p(fill(T.fileMatch, { name: res.file.manifest_name })),
      reveal(h('details', 'r-src', [h('summary', null, [T.view]), h('pre', null, [textBody])]))
    ]);
  }

  function checkText(c, res, doc) {
    var v = c.value;
    if (c.id === 'signatures') { need(v.length === 0, 'a signature field'); return T.sigNone; }
    need(c.ok === true, 'check ' + c.id);
    switch (c.id) {
      case 'period-function': return fill(T.a2Ok, { v: v });
      case 'window': return fill(T.a3Ok, { start: v.start, end: v.end, h: group(String(v.hours)), s: group(String(v.sample_interval_s)), n: group(String(v.hours * 3600 / v.sample_interval_s)) });
      case 'covered-layers': return fill(T.b7Ok, { list: listing(v) });
      case 'events':
        need(v.events > 1 && v.subjects > 1, 'a single event or subject');
        return fill(T.eventsOk, { e: word(v.events).toLowerCase(), s: word(v.subjects).toLowerCase() });
      case 'causes': return T.causesOk;
      case 'materiality':
        if (v === 'MT-02') {
          var plans = doc.standard.G3_filing_plan_sample_interval_s, s = doc.standard.A3_sample_interval_s;
          need(plans && plans.operator === s && plans.customer === s, 'Filing Plans without the A3 interval');
          return fill(T.pickMt02, { n: String(res.divergence.threshold_intervals), s: group(String(s)) });
        }
        return fill(T.pickOk, { clause: c.clause, v: v, annex: ANNEX[c.id] });
      case 'unresolved-ceiling':
        if (res.ceiling.parameter_pct !== null) return fill(T.pickUc, { v: v, p: res.ceiling.parameter_pct });
        return fill(T.pickOk, { clause: c.clause, v: v, annex: ANNEX[c.id] });
      default: return fill(T.pickOk, { clause: c.clause, v: v, annex: ANNEX[c.id] });
    }
  }

  function checksSection(res, doc) {
    need(!res.stop, 'a stop at ' + res.stop);
    var rows = res.checks.map(function (c) {
      return reveal(h('div', 'r-check', [h('span', 'cl', [c.clause]), h('span', 't', [checkText(c, res, doc)]), mark(c.ok)]));
    });
    var passed = res.checks.filter(function (c) { return c.ok === true; }).length;
    var judged = res.checks.filter(function (c) { return c.ok !== null; }).length;
    return section(T.secChecks, fill(T.secChecksR, { m: String(passed), n: String(judged) }), rows);
  }

  function layerReading(doc) {
    var covered = doc.standard.B7_covered_layers;
    var hits = Object.keys(doc.events).filter(function (k) {
      var e = doc.events[k];
      return e['class'] === 'disputed' && covered.indexOf(e.layer) >= 0 &&
        (e.operator_reading === 'conforming') !== (e.customer_reading === 'conforming');
    });
    need(hits.length === 1 && doc.events[hits[0]].subjects.length === 1, 'one disputed event read conforming by one party on one subject');
    var e = doc.events[hits[0]];
    return { event: hits[0], n: group(String(e.intervals)), party: WHO[e.operator_reading === 'conforming' ? 'operator' : 'customer'], subject: e.subjects[0] };
  }

  function requiredReading(doc) {
    var names = function (cls) { return Object.keys(doc.events).filter(function (k) { return doc.events[k]['class'] === cls; }); };
    var unresolved = names('unresolved'), unilateral = names('unilateral');
    need(unresolved.length === 1 && unilateral.length === 1, 'one unresolved and one unilateral event');
    var seen = doc.events[unilateral[0]].observed_by;
    need(seen === 'operator' || seen === 'customer', 'the observing party of ' + unilateral[0]);
    return { unresolved: unresolved[0], unilateral: unilateral[0], party: WHO[seen === 'operator' ? 'customer' : 'operator'] };
  }

  function readingsSection(res, doc) {
    return section(T.secReadings, T.secReadingsR, [p(T.readLead)].concat(res.readings.map(function (r) {
      return p(fill(T[r], r === 'layer' ? layerReading(doc) : r === 'required' ? requiredReading(doc) : {}), 'r-p r-dim');
    })));
  }

  function denominatorsSection(res, doc) {
    var d = res.denominators, std = doc.standard, c = res.ceiling;
    need(c.within === true && c.form === 'UC-01', 'ceiling ' + c.form);
    need(res.faults.every(function (f) { return f.clause === 'C5.4'; }), 'an undeclared gap');
    var kids = [
      p(fill(T.perSubjectN, { h: group(String(std.A3_window_hours)), s: group(String(std.A3_sample_interval_s)), n: group(String(d.intervals_per_subject)) }), 'r-p r-dim'),
      p(fill(T.totalN, { k: String(d.subjects), n: group(String(d.intervals_per_subject)), t: group(String(d.total_subject_intervals)) }), 'r-p r-dim'),
      h('div', 'r-gap'),
      line(T.dTotal, group(String(d.total_subject_intervals))),
      line(T.dA4, '− ' + group(String(d.a4_exclusions)), 'sub'),
      line(T.dBefore, group(String(d.eligible_before_C5)), 'em'),
      line(T.dUnres, '− ' + group(String(d.unresolved)), 'sub'),
      line(T.dElig, group(String(d.eligible)), 'em'),
      reveal(h('div', 'r-subjects', [h('span', 'k', [T.dPer])].concat(res.per_subject.map(function (r) {
        return h('span', 's', [h('i', null, [r.id]), ' ', group(String(r.eligible))]);
      })))),
      h('div', 'r-gap'),
      p(fill(T.ufLine, { u: group(String(d.unresolved)), b: group(String(d.eligible_before_C5)), pct: res.fractions.unresolved.pct })),
      p(fill(T.ufWithin, { p: c.parameter_pct, form: c.form }), 'r-p r-dim'),
      p(fill(T.ulLine, { u: group(String(d.unilateral)), b: group(String(d.eligible_before_C5)), pct: res.fractions.unilateral.pct }))
    ];
    var other = { operator: 'customer', customer: 'operator' };
    res.faults.forEach(function (f) {
      kids.push(p(fill(T.faultC54, { event: f.event, other: WHO[other[f.party]], party: WHO[f.party], n: group(String(f.subject_intervals)) }), 'r-p r-dim'));
    });
    return section(T.secDen, T.secDenR, kids);
  }

  function figuresSection(res) {
    var pf = res.period_figures;
    var big = h('div', 'r-figs', ['operator', 'customer'].map(function (party) {
      return reveal(h('div', 'r-fig', [h('div', 'party', [T[party]]), h('div', 'num', [pc(pf[party].pct)]), h('div', 'ex', ['= ' + pf[party].ratio])]));
    }));
    var rows = [h('div', 'r-row head', [h('span', null, [T.perSubjectHead]), h('span', null, [T.operator]), h('span', null, [T.customer])])];
    res.per_subject.forEach(function (r) {
      var off = r.pct.operator !== '100.000000' || r.pct.customer !== '100.000000';
      rows.push(reveal(h('div', 'r-row' + (off ? ' off' : ''), [h('span', null, [r.id]), h('span', null, [pc(r.pct.operator)]), h('span', null, [pc(r.pct.customer)])])));
    });
    return section(T.secFig, fill(T.secFigR, { f: pf['function'] }), [p(fill(T[pf['function']], {})), big, h('div', 'r-table', rows)]);
  }

  function divergenceSection(res) {
    var d = res.divergence, pf = res.period_figures;
    need(d.materiality === 'MT-02' && d.material === true && res.sigma_output === 'requires-review' && d.first_interval_complete === true,
      'a divergence outside the Annex 3.5 case');
    var layer = d.parting.map(function (x) { return x.layer + ', ' + x.subjects.join(', '); }).join(' · ');
    return section(T.secDiv, T.secDivR, [
      p(fill(T.divLine, { pp: d.pp })),
      p(fill(T.mt02Material, { w: group(String(d.widest_subject_intervals)), subjects: (d.widest_subjects.length > 1 ? 'each of ' : '') + listing(d.widest_subjects), t: group(String(d.threshold_intervals)) })),
      p(T.h5, 'r-p r-dim'),
      line(T.hBoth, pc(pf.operator.pct) + ' · ' + pc(pf.customer.pct)),
      line(T.hFirst, d.first_interval, 'mono'),
      line(T.hLayer, layer),
      line(T.hUf, pc(res.fractions.unresolved.pct) + ' · ' + pc(res.fractions.unresolved.pct)),
      p(T.dr06, 'r-p r-sigma')
    ]);
  }

  function tierLabel(schedule, i) {
    var e = schedule[i];
    if (Object.prototype.hasOwnProperty.call(e, 'below')) return '< ' + two(plainNum(e.below)) + NB + '%';
    var prev = i > 0 ? schedule[i - 1] : null;
    if (prev && Object.prototype.hasOwnProperty.call(prev, 'at_or_above')) return two(plainNum(e.at_or_above)) + NB + '% to below ' + two(plainNum(prev.at_or_above)) + NB + '%';
    return '≥ ' + two(plainNum(e.at_or_above)) + NB + '%';
  }
  function quoteRow(label, pct, q, schedule) {
    need(q.tier !== null && q.usd !== null, 'a quote without a tier');
    return reveal(h('div', 'r-row q', [h('span', null, [label]), h('span', null, [pc(pct)]),
      h('span', null, [tierLabel(schedule, q.tier)]),
      h('span', null, [shift(q.credit, 2) + NB + '%' + ' → ' + money(q.usd)])]));
  }

  function moneySection(res, doc) {
    var m = res.money, std = doc.standard, schedule = std.A7_remedy_schedule;
    need(m.fee_usd !== null && m.held === null && m.disputed_usd !== null, 'money held or unpriced');
    return section(T.secMoney, T.secMoneyR, [
      p(fill(T.fee, { k: String(res.denominators.subjects), a: group(plainNum(std.A8_accelerators_per_subject)), h: group(String(std.A3_window_hours)), ah: group(m.accelerator_hours), price: two(m.price_usd), fee: group(m.fee_usd) })),
      h('div', 'r-table', [quoteRow(T.opFiling, res.period_figures.operator.pct, m.operator, schedule),
        quoteRow(T.cuFiling, res.period_figures.customer.pct, m.customer, schedule)]),
      p(fill(T.disputedAmt, { d: group(m.disputed_usd) })),
      p(T.carried, 'r-p r-dim')
    ]);
  }

  function alternatesSection(res, doc) {
    var schedule = doc.standard.A7_remedy_schedule;
    var rows = res.alternates.map(function (a) {
      return quoteRow(a['function'] + ' · ' + fill(T['alt-' + a['function']], {}), a.operator.pct, a.operator, schedule);
    });
    return section(T.secAlt, T.secAltR, [p(T.altLead), h('div', 'r-table', rows)]);
  }

  function comparisonSection(res) {
    var rows = res.comparison, judged = rows.filter(function (r) { return r.match !== null; });
    need(rows.every(function (r) { return r.match !== false; }), 'a value that differs from the vector');
    var matched = judged.filter(function (r) { return r.match === true; }).length;
    var head = h('div', 'c-row head', [h('span', null, ['']), h('span', null, [T.cmpRc]), h('span', null, [T.cmpFd]), h('span', null, [''])]);
    var kids = [p(T.cmpLead), h('div', 'r-cmp', [head].concat(rows.map(function (r) {
      return reveal(h('div', 'c-row' + (r.recomputed === null ? ' note' : ''), [h('span', 'key', [r.key]),
        h('span', 'rc', [r.recomputed === null ? '' : r.recomputed]), h('span', 'fd', [r.filed]), mark(r.match)]));
    })))];
    return section(T.secCmp, fill(T.cmpCount, { m: String(matched), n: String(judged.length) }), kids);
  }

  function casesSection(res, doc) {
    need(res.count > 1 && res.signature_fields.length === 0, 'an edge-case file outside the bundled one');
    var list = doc.cases.map(function (c) {
      return reveal(h('div', 'r-case', [h('div', 'id', [h('span', null, [c.id]), h('span', 'cl', [c.clause])]),
        h('p', 'in', [h('span', 'k', [T.cInput]), ' ', c.input]),
        h('p', null, [h('span', 'k', [T.cExpect]), ' ', c.expect]),
        h('p', 'no', [h('span', 'k', [T.cMust]), ' ', c.must_not])]));
    });
    return section(T.secCases, T.secCasesR, [p(fill(T.casesLead, { count: word(res.count).toLowerCase() })), p(T.sigNone, 'r-p r-dim')].concat(list));
  }

  // ---- open a bundled vector ------------------------------------------------------------
  function openBundled(name) {
    var textBody = V.files[name], bytes = new TextEncoder().encode(textBody);
    var res = SQCD1.recompute(bytes, MANIFEST), doc = JSON.parse(textBody);
    order = 0;
    resultEl.textContent = '';
    resultEl.setAttribute('data-state', 'running');
    var parts = [fileSection(res, name, textBody)];
    if (res.kind === 'edge-cases') {
      parts.push(casesSection(res, doc));
    } else {
      need(res.kind === 'worked-month', 'a file kind ' + res.kind);
      parts.push(checksSection(res, doc), denominatorsSection(res, doc), figuresSection(res), divergenceSection(res),
        moneySection(res, doc), alternatesSection(res, doc), comparisonSection(res), readingsSection(res, doc));
    }
    parts.forEach(function (s) { resultEl.appendChild(s); });
    document.querySelectorAll('[data-open]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-open') === name ? 'true' : 'false');
    });
    window.__recompute.result = JSON.stringify(res);
    window.__recompute.name = name;
    resultEl.setAttribute('data-state', 'ready');
  }

  window.__recompute = { T: T, openBundled: openBundled, result: null, name: null };

  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var name = b.getAttribute('data-open');
      openBundled(name);
      if (history.replaceState) history.replaceState(null, '', '#' + name.replace(/\.json$/, ''));
    });
  });
  function fromHash() { openBundled(location.hash === '#edge-cases' ? 'edge-cases.json' : 'annex3-worked-month.json'); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
